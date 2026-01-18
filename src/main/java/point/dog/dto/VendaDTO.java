package point.dog.dto;

import lombok.Data;
import java.util.List;

@Data
public class VendaDTO {
    
    private Long clienteId;      
    private String clienteNome;   
    private String clienteTelefone; 
    private String clienteEndereco; 

    private List<ItemInput> itens;
    
    @Data
    public static class ItemInput {
        private Long produtoId;   
        private String nome;      
        private Double preco;
        private Integer quantidade;
    }
}