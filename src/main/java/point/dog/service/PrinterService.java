package point.dog.service;

import point.dog.model.Pedido;
import com.github.anastaciocintra.escpos.EscPos;
import com.github.anastaciocintra.escpos.EscPosConst;
import com.github.anastaciocintra.escpos.Style;
import com.github.anastaciocintra.output.PrinterOutputStream;
import org.springframework.stereotype.Service;

import javax.print.PrintService;
import java.io.OutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PrinterService {

    public void imprimirCupom(Pedido pedido) {
        try {
            PrintService printService = null;
            OutputStream outputStream = null;

            // === 1. BUSCA INTELIGENTE DA IMPRESSORA ===
            String[] impressorasInstaladas = PrinterOutputStream.getListPrintServicesNames();
            
            for (String nome : impressorasInstaladas) {
                // Procura Elgin, Epson, Pos-58, etc.
                if (nome.toLowerCase().contains("elgin") || 
                    nome.toLowerCase().contains("i9") || 
                    nome.toLowerCase().contains("pos")) {
                    
                    printService = PrinterOutputStream.getPrintServiceByName(nome);
                    System.out.println("✅ Impressora detectada: " + nome);
                    break;
                }
            }

            // === 2. DECISÃO: HARDWARE OU CONSOLE ===
            if (printService != null) {
                outputStream = new PrinterOutputStream(printService);
            } else {
                System.out.println("⚠️ Modo DEV: Imprimindo no Console.");
                outputStream = System.out;
            }

            // === 3. MONTAGEM DO CUPOM ===
            try (EscPos escpos = new EscPos(outputStream)) {
                
                // Estilos
                Style titulo = new Style().setFontSize(Style.FontSize._2, Style.FontSize._2)
                        .setJustification(EscPosConst.Justification.Center).setBold(true);
                Style negrito = new Style().setBold(true);
                Style centro = new Style().setJustification(EscPosConst.Justification.Center);

                // Cabeçalho
                escpos.writeLF(titulo, "Point Dog Pet Shop");
                escpos.writeLF(centro, "Cumpom não fiscal");
                escpos.writeLF("--------------------------------");

                // Dados Pedido
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM HH:mm");
                escpos.writeLF("PEDIDO: " + pedido.getId() + " - " + pedido.getDataHora().format(fmt));
                
                // === DADOS DO CLIENTE (COM TELEFONE) ===
                if (pedido.getCliente() != null) {
                    escpos.writeLF(negrito, "CLIENTE:");
                    escpos.writeLF(pedido.getCliente().getNome());
                    
                    // AQUI ESTÁ A CORREÇÃO:
                    escpos.writeLF(negrito, "TELEFONE:");
                    escpos.writeLF(pedido.getCliente().getTelefone());
                    
                    escpos.writeLF(negrito, "ENDERECO:");
                    escpos.writeLF(pedido.getCliente().getEndereco());
                } else {
                    escpos.writeLF("CLIENTE: Consumidor");
                }

                escpos.writeLF("--------------------------------");
                escpos.writeLF(negrito, "ITEM             QTD   TOTAL");

                // Itens
                for (var item : pedido.getItens()) {
                    String nome = item.getProduto().getNome();
                    if(nome.length() > 15) nome = nome.substring(0, 15); // Corta nome longo
                    
                    String linha = String.format("%-15s %3d %7.2f", 
                        nome, item.getQuantidade(), item.getSubtotal());
                    escpos.writeLF(linha);
                }

                escpos.writeLF("--------------------------------");
                escpos.feed(1);
                escpos.writeLF(titulo, "TOTAL: R$ " + String.format("%.2f", pedido.getTotal()));
                escpos.feed(1);
                escpos.writeLF(centro, "Volte Sempre!");
                
                // === 4. CORTE ===
                if (printService != null) {
                    escpos.feed(4);
                    escpos.cut(EscPos.CutMode.FULL);
                } else {
                    escpos.writeLF("\n[TESOURA VIRTUAL: PAPEL CORTADO]\n");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}