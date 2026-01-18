package point.dog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import point.dog.model.Cliente;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Aqui você pode criar buscas personalizadas se precisar
    // Exemplo: Buscar por parte do nome (para o autocomplete do caixa)
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
    
    // Buscar por telefone (para identificar cliente na hora do pedido)
    Cliente findByTelefone(String telefone);

    Cliente findByEndereco(String endereco);
}