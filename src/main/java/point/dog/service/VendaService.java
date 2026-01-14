package point.dog.service;

import point.dog.dto.VendaDTO;
import point.dog.repository.*;
import point.dog.model.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VendaService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    private PrinterService printerService;

    @Transactional
    public Pedido registrarVenda(VendaDTO dto) {

        Cliente cliente;

        if (dto.getClienteId() != null) {
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        } else {
            // === VALIDAÇÃO NOVA ===
            if (dto.getClienteNome() == null || dto.getClienteNome().isBlank() ||
                    dto.getClienteEndereco() == null || dto.getClienteEndereco().isBlank() ||
                    dto.getClienteTelefone() == null || dto.getClienteTelefone().isBlank()) {

                throw new RuntimeException("Para novos clientes, Nome, Endereço e Telefone são obrigatórios!");
            }
        }

        // Se passou, cria:
        cliente = new Cliente();
        cliente.setNome(dto.getClienteNome());
        cliente.setTelefone(dto.getClienteTelefone());
        cliente.setEndereco(dto.getClienteEndereco());
        cliente = clienteRepository.save(cliente);

        // === 2. INICIAR O PEDIDO ===
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setDataHora(LocalDateTime.now());

        double totalCalculado = 0.0;

        // === 3. RESOLVER OS PRODUTOS (FIND OR CREATE) ===
        for (VendaDTO.ItemInput itemDto : dto.getItens()) {
            Produto produto;

            if (itemDto.getProdutoId() != null) {
                // Produto JÁ EXISTE (selecionado da lista)
                produto = produtoRepository.findById(itemDto.getProdutoId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
            } else {
                // Produto NOVO (digitado na hora)
                // Ex: "Banho Tosa Higiênica"
                produto = new Produto();
                produto.setNome(itemDto.getNome());
                produto.setPreco(itemDto.getPreco());
                produto = produtoRepository.save(produto); // Cadastra no banco para a próxima vez
            }

            // Cria o item do pedido
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDto.getQuantidade());

            // Lógica de Preço:
            // Se o usuário mandou um preço explícito (desconto ou valor novo), usa ele.
            // Se não, usa o preço do cadastro do produto.
            Double precoFinal = (itemDto.getPreco() != null) ? itemDto.getPreco() : produto.getPreco();
            itemPedido.setPrecoUnitario(precoFinal);

            pedido.adicionarItem(itemPedido);
            totalCalculado += (precoFinal * itemDto.getQuantidade());
        }

        pedido.setTotal(totalCalculado);

        // === 4. FINALIZAR ===
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // Impressão em Thread separada
        /* 
        new Thread(() -> {
            try {
                Pedido pedidoCompleto = pedidoRepository.findPedidoCompletoPorId(pedidoSalvo.getId());
                printerService.imprimirCupom(pedidoCompleto);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        */

        return pedidoSalvo;
    }

    public void imprimirVenda(Long idPedido) {
        new Thread(() -> {
            try {
                Pedido pedido = pedidoRepository.findPedidoCompletoPorId(idPedido);
                if (pedido != null) {
                    printerService.imprimirCupom(pedido);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
}