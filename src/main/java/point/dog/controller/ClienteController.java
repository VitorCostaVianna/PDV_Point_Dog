package point.dog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import point.dog.model.Cliente;
import point.dog.model.Pedido;
import point.dog.repository.ClienteRepository;
import point.dog.repository.PedidoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired private ClienteRepository clienteRepository;
    @Autowired private PedidoRepository pedidoRepository;
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }
    @GetMapping("/{id}/historico")
    public List<Pedido> getHistorico(@PathVariable Long id) {
        return pedidoRepository.findByClienteId(id);
    }
}