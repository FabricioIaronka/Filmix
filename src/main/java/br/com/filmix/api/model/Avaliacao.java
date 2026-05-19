package br.com.filmix.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "avaliacao")
public class Avaliacao {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nota",nullable = false)
    private Float nota;

    @Column(name = "comentario", length = 255)
    private String comentario;

    @Column(name = "data_avaliacao")
    private LocalDateTime dataAvaliacao;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "filme_id", nullable = false)
    private Filme filme;

}
