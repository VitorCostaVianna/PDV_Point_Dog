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
            if (dto.getClienteNome() == null || dto.getClienteNome().isBlank() ||
                    dto.getClienteEndereco() == null || dto.getClienteEndereco().isBlank() ||
                    dto.getClienteTelefone() == null || dto.getClienteTelefone().isBlank()) {

                throw new RuntimeException("Para novos clientes, Nome, Endereço e Telefone são obrigatórios!");
            }

            String tel = dto.getClienteTelefone();
            Cliente existente = clienteRepository.findByTelefone(tel);
            if (existente != null) {
                cliente = existente;
            } else {
                cliente = new Cliente();
                cliente.setNome(dto.getClienteNome());
                cliente.setTelefone(dto.getClienteTelefone());
                cliente.setEndereco(dto.getClienteEndereco());
                cliente = clienteRepository.save(cliente);
            }
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setDataHora(LocalDateTime.now());

        double totalCalculado = 0.0;

        for (VendaDTO.ItemInput itemDto : dto.getItens()) {
            Produto produto;

            if (itemDto.getProdutoId() != null) {
                produto = produtoRepository.findById(itemDto.getProdutoId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
            } else {
                String nomeProduto = itemDto.getNome().trim();

                produto = produtoRepository.findByNomeIgnoreCase(nomeProduto)
                        .orElseGet(() -> {
                            Produto novo = new Produto();
                            novo.setNome(nomeProduto);
                            novo.setPreco(itemDto.getPreco());
                            return produtoRepository.save(novo);
                        });
            }

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDto.getQuantidade());

            Double precoFinal = (itemDto.getPreco() != null) ? itemDto.getPreco() : produto.getPreco();
            itemPedido.setPrecoUnitario(precoFinal);

            pedido.adicionarItem(itemPedido);
            totalCalculado += (precoFinal * itemDto.getQuantidade());
        }

        pedido.setTotal(totalCalculado);

        return pedidoRepository.save(pedido);
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