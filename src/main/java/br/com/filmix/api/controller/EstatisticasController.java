package br.com.filmix.api.controller;

import br.com.filmix.api.dto.usuario.EstatisticasUsuarioDTO;
import br.com.filmix.api.model.Usuario;
import br.com.filmix.api.repository.AvaliacaoRepository;
import br.com.filmix.api.repository.UsuarioFilmeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticasController {

    @Autowired
    private UsuarioFilmeRepository usuarioFilmeRepository;

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @GetMapping("/usuario")
    public ResponseEntity<EstatisticasUsuarioDTO> getEstatisticasDoUsuario(@AuthenticationPrincipal Usuario usuarioLogado) {
        long totalFilmes = usuarioFilmeRepository.countByUsuario(usuarioLogado);
        long totalAvaliacoes = avaliacaoRepository.countByUsuario(usuarioLogado);
        long totalVistos = usuarioFilmeRepository.countByUsuarioAndVisto(usuarioLogado, true);

        var estatisticas = new EstatisticasUsuarioDTO(totalFilmes, totalAvaliacoes, totalVistos);
        return ResponseEntity.ok(estatisticas);
    }
}