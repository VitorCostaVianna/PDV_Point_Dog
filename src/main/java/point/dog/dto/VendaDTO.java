package point.dog.dto;

import lombok.Data;
import java.util.List;

@Data
public class VendaDTO {
    
    // === DADOS DO CLIENTE ===
    private Long clienteId;       // Opcional (se já existir)
    private String clienteNome;   // Obrigatório se ID for nulo
    private String clienteTelefone; // Opcional
    private String clienteEndereco; // Opcional

    // === LISTA DE ITENS ===
    private List<ItemInput> itens;
    
    @Data
    public static class ItemInput {
        private Long produtoId;    // Opcional (se produto já existir)
        private String nome;       // Obrigatório se ID for nulo (Ex: "Banho Especial")
        private Double preco;      // Obrigatório se ID for nulo (ou se quiser mudar o preço na hora)
        private Integer quantidade;
    }
}