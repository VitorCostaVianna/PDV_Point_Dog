package point.dog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import point.dog.model.Pedido;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // QUERY 1: Busca o Pedido + Cliente (Para listagens rápidas)
    // Resolve o N+1 do Cliente. Traz tudo num SELECT só.
    @Query("SELECT p FROM Pedido p JOIN FETCH p.cliente")
    List<Pedido> findAllComCliente();

    // QUERY 2: Busca Pedido + Cliente + Itens + Produto (Para reimpressão/Detalhes)
    // Essa é a query "pesada" mas otimizada. Traz a árvore inteira de uma vez.
    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.cliente " +
           "JOIN FETCH p.itens i " +
           "JOIN FETCH i.produto " + 
           "WHERE p.id = :id")
    Pedido findPedidoCompletoPorId(@Param("id") Long id);

    // QUERY 3: Histórico por Data (Otimizado)
    @Query("SELECT p FROM Pedido p JOIN FETCH p.cliente WHERE p.dataHora BETWEEN :inicio AND :fim")
    List<Pedido> findByDataBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // Busca pedidos de um cliente específico trazendo os itens (para evitar erro de Lazy Loading)
    @Query("SELECT p FROM Pedido p JOIN FETCH p.itens i JOIN FETCH i.produto WHERE p.cliente.id = :clienteId ORDER BY p.dataHora DESC")
    List<Pedido> findByClienteId(@Param("clienteId") Long clienteId);
}
