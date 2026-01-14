package point.dog.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private LocalDateTime dataHora = LocalDateTime.now();

    private Double total;

    // mappedBy: indica que quem manda na relação é o campo 'pedido' lá na classe ItemPedido
    // cascade: Ao salvar Pedido, salva os Itens automaticamente
    // orphanRemoval: Se remover um item da lista, apaga do banco
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    // Método auxiliar para facilitar adicionar itens no código
    public void adicionarItem(ItemPedido item) {
        itens.add(item);
        item.setPedido(this);
    }
}