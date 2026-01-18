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

    @Query("SELECT p FROM Pedido p JOIN FETCH p.cliente")
    List<Pedido> findAllComCliente();

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.cliente " +
           "JOIN FETCH p.itens i " +
           "JOIN FETCH i.produto " + 
           "WHERE p.id = :id")
    Pedido findPedidoCompletoPorId(@Param("id") Long id);

    @Query("SELECT p FROM Pedido p JOIN FETCH p.cliente WHERE p.dataHora BETWEEN :inicio AND :fim")
    List<Pedido> findByDataBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT p FROM Pedido p JOIN FETCH p.itens i JOIN FETCH i.produto WHERE p.cliente.id = :clienteId ORDER BY p.dataHora DESC")
    List<Pedido> findByClienteId(@Param("clienteId") Long clienteId);
}
