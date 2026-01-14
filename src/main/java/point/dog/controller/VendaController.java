package point.dog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import point.dog.dto.VendaDTO;
import point.dog.model.Pedido;
import point.dog.service.VendaService;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @PostMapping
    public ResponseEntity<Pedido> criarVenda(@RequestBody VendaDTO dto) {
        Pedido novoPedido = vendaService.registrarVenda(dto);
        return ResponseEntity.ok(novoPedido);
    }

    @PostMapping("/{id}/imprimir")
    public ResponseEntity<Void> imprimirVenda(@PathVariable Long id) {
        vendaService.imprimirVenda(id);
        return ResponseEntity.ok().build();
    }
}
