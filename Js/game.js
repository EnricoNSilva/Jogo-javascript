// Configurações iniciais do canvas e do contexto
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
// Constantes do jogo
const INTERVALO_ENTRE_ONDAS = 5000;
const MAX_INIMIGOS = 500;
const mapa_largura = 3024;
const mapa_altura = 2520;
const visivel_largura = 1000;
const visivel_altura = 750;
const VELOCIDADE_JOGADOR = 1; // velocidade do jogador
// Função de ajuste do canvas
function ajustarcanvas() {
    canvas.width = visivel_largura;
    canvas.height = visivel_altura;
}
// Atualiza o canvas ao carregar e redimensionar a janela
window.addEventListener('load', ajustarcanvas);
window.addEventListener('resize', ajustarcanvas);

// Classe do jogador
class Jogador {
    constructor(x, y, largura, altura) {
        this.x = x; // Posição X inicial
        this.y = y; // Posição Y inicial
        this.largura = largura; // Largura do sprite jogador
        this.altura = altura; // Altura do sprite jogador
        this.vidaMaxima = 100; // VidaMaxima inicial
        this.nivel = 1; // Nível inicial
        this.experiencia = 0; // Experiência inicial
        this.experienciaNecessaria = 100; // Experiência necessária para o próximo nível
        this.danoBase = 10; // Dano inicial
        this.tempoRecargaBase = 1000; // Tempo de recarga inicial em ms
        this.raioColeta = 100 // Raio de coleta das engrenagens
    
        
        // Inicializa armas
        this.laser = new Laser(); // Inicializa o laser
        this.eletromagnetismo = null; // Inicializa o eletromagnetismo como null
 

        // Sprites para cada direção
        this.spriteDireita1 = new Image();
        this.spriteDireita1.src = "../img/Jogador_direita_1.png";
        this.spriteDireita2 = new Image();
        this.spriteDireita2.src = "../img/Jogador_direita_2.png";

        this.spriteEsquerda1 = new Image();
        this.spriteEsquerda1.src = "../img/Jogador_esquerda_1.png";
        this.spriteEsquerda2 = new Image();
        this.spriteEsquerda2.src = "../img/Jogador_esquerda_2.png";

        // Controle de direção e animação
        this.direcao = 'direita'; // Começa assumindo que está parado ou olhando para a direita
        this.currentFrame = 1; // Inicia no primeiro frame
        this.tempoUltimaTroca = Date.now();
        this.intervaloTrocaFrame = 200; // Tempo entre trocas de frame, em milissegundos
    }

    // Função para trocar entre os frames
    atualizarFrame() {
        const agora = Date.now();
        if (agora - this.tempoUltimaTroca >= this.intervaloTrocaFrame) {
            this.currentFrame = this.currentFrame === 1 ? 2 : 1; // Alterna entre o frame 1 e 2
            this.tempoUltimaTroca = agora;
        }
    }

    // Função que desenha o sprite do jogador
    desenha(cameraX, cameraY) {
        this.atualizarFrame();

        // Escolhe o sprite atual com base na direção e no frame atual
        let spriteAtual;
        if (this.direcao === 'direita') {
            spriteAtual = this.currentFrame === 1 ? this.spriteDireita1 : this.spriteDireita2;
        } else {
            spriteAtual = this.currentFrame === 1 ? this.spriteEsquerda1 : this.spriteEsquerda2;
        }

        // Desenha o sprite na posição do jogador
        ctx.drawImage(spriteAtual, this.x - cameraX, this.y - cameraY, this.largura, this.altura);
    }

    // Função que aumenta a quantidade de experiencia
    ganharExperiencia(quantidade) {
        this.experiencia += quantidade;
        if (this.experiencia >= this.experienciaNecessaria) {
             this.uparNivel(); 
            } }

    // Função para aumentar de nivel, por exemplo do nível 1 para o 2
    uparNivel() {
        this.nivel++; 
        this.experiencia -= this.experienciaNecessaria;
        this.experienciaNecessaria = Math.round(this.experienciaNecessaria * 1.5);

        // Atualiza o Laser
        this.laser.aumentarDano(5); // Aumenta o dano do laser 
        this.laser.diminuirTempoRecarga(0.9); // Diminui o tempo de recarga do laser

        this.vidaMaxima += 5; // Aumenta a vida máxima
        this.vida += 10; // Cura o jogador
        if (this.vida > this.vidaMaxima) {
            this.vida = this.vidaMaxima; // Garante que a vida não ultrapasse a vida máxima
        }

        // Adquire Eletromagnetismo no nível 3
        if (this.nivel === 3) {
            this.eletromagnetismo = new Eletromagnetismo(); // Inicializa o Eletromagnetismo
        }

        // Atualiza Eletromagnetismo a partir do nível 4
        if (this.nivel > 3 && this.eletromagnetismo) {
            this.eletromagnetismo.forcaAtaque += 2; // Aumenta o dano do Eletromagnetismo
            this.eletromagnetismo.raio += 15; // Aumenta o raio do Eletromagnetismo
        }
    }

    // Função para o jogador coletar a peça, que faz com que ele aumente o numero de experiencia
    coletarPeca(PecaMecanica) {
        const distancia = Math.sqrt((this.x - PecaMecanica.x) ** 2 + (this.y - PecaMecanica.y) ** 2);
        if (distancia <= 100) { // Verifica o raio de coleta de 100 pixels
            this.ganharExperiencia(PecaMecanica.experiencia);
            peca.coletada = true; // Marca a peça como coletada
        }
    }

    // Função que movimenta o jogador para cada direção
    mover(teclasPressionadas) {
        let movendo = false;

        if (teclasPressionadas['w']) {
            this.y = Math.max(this.y - VELOCIDADE_JOGADOR, 0);
            movendo = true;
        }
        if (teclasPressionadas['s']) {
            this.y = Math.min(this.y + VELOCIDADE_JOGADOR, mapa_altura - this.altura);
            movendo = true;
        }
        if (teclasPressionadas['a']) {
            this.x = Math.max(this.x - VELOCIDADE_JOGADOR, 0);
            this.direcao = 'esquerda';
            movendo = true;
        }
        if (teclasPressionadas['d']) {
            this.x = Math.min(this.x + VELOCIDADE_JOGADOR, mapa_largura - this.largura);
            this.direcao = 'direita';
            movendo = true;
        }

        // Pausa a animação quando o jogador para de se mover
        if (!movendo) {
            this.currentFrame = 1; // Volta ao primeiro frame quando parado
        }
    }

    dmg(valorDano) {
        this.vidaMaxima -= valorDano;
        if (this.vidaMaxima <= 0) this.vidaMaxima = 0;
    }
}

// Classe de drop dos inimigos
class PecaMecanica {
    constructor(x, y, caminhoImagem, experiencia) {
        this.x = x;
        this.y = y;
        this.caminhoImagem = caminhoImagem;
        this.experiencia = experiencia;
        this.imagem = new Image();
        this.imagem.src = caminhoImagem;
        this.coletada = false; // Marca se a peça foi coletada
        this.velocidadeAtracao = 3; // Velocidade com que ela vai até o jogador
    }

    // Desenho do item
    desenhar(cameraX, cameraY) {
        ctx.drawImage(this.imagem, this.x - cameraX, this.y - cameraY, 20, 20); 
    }

    // Faz com que, quando o jogador passar proximo a peça, ela faça uma animação de atração até o jogador
    moverParaJogador(jogador) {
        // Calcula a direção ao jogador
        const dx = jogador.x - this.x;
        const dy = jogador.y - this.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
    
        // Verifica se a peça está próxima o suficiente para ser coletada
        if (distancia < 10) {
            this.coletada = true;
        } else {
            // Move a peça em direção ao jogador
            this.x += (dx / distancia) * this.velocidadeAtracao;
            this.y += (dy / distancia) * this.velocidadeAtracao;
        }
    }
}

// classe do texto de dano que sobe quando um inimigo é atingido
class TextoDano {
    constructor(texto, x, y) {
        this.texto = texto;
        this.x = x;
        this.y = y;
        this.contagemFrames = 0;
        this.framesCrescimento = 40;
        this.framesDesvanecimento = 60;
        this.tamanhoFonte = 10;
        this.opacidadeFonte = 1;
        this.tamanhoFinal = 32;
        this.corTexto = 'white';
        this.corBorda = 'black';
    }

    atualizar() {
        this.y -= 0.5; // Faz o texto "subir" com o tempo
        if (this.contagemFrames < this.framesCrescimento) {
            this.tamanhoFonte = this.interpolar(this.tamanhoFonte, this.tamanhoFinal, 0.4);
        } else if (this.contagemFrames < this.framesCrescimento + this.framesDesvanecimento) {
            this.opacidadeFonte = this.interpolar(this.opacidadeFonte, 0, 0.25);
        } else {
            this.destruir = true;
        }
        this.contagemFrames += 1;
    }

    interpolar(inicial, final, fator) {
        return inicial + (final - inicial) * fator;
    }

    desenhar(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.font = `${this.tamanhoFonte}px monospace`;
        ctx.fillStyle = this.corTexto;
        ctx.strokeStyle = this.corBorda;
        ctx.globalAlpha = this.opacidadeFonte;
        
        // Compensa a posição do texto usando as coordenadas da câmera
        ctx.fillText(this.texto, this.x - cameraX, this.y - cameraY);
        
        ctx.restore();
    }
}

// Classe de Inimigos
class Inimigo {
    constructor(x, y, largura, altura, vida, velocidade, dano, experiencia, caminhoPeca) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.vida = vida;
        this.velocidade = velocidade;
        this.dano = dano;
        this.experiencia = experiencia; //EXP dropada de cada inimigo
        this.caminhoPeca = caminhoPeca; // caminho para acessar a png de cada peça
        this.ultimoDano = 0;
        this.ultimoDanoEletromagnetismo = 0; // Adiciona tempo de recarga específico para Eletromagnetismo
        this.intervaloDanoEletromagnetismo = 1000; // Intervalo para dano da arma Eletromagnetismo
        this.ultimoDanoAplicado = 0; // Inicializa o último dano aplicado
        this.intervaloDano = 1000; // 1 segundo de intervalo
        this.destruido = false;
    }

    // Função que desenha os inimigos
    desenha(cameraX, cameraY) {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.largura, this.altura);
    }   

    // Função para fazer o movimento dos inimigos em direção ao jogador
    mover(jogador) {
        let dx = jogador.x - this.x;
        let dy = jogador.y - this.y;
        let distancia = Math.sqrt(dx * dx + dy * dy);
    
        if (distancia > 0) {
            this.x += (dx / distancia) * this.velocidade;
            this.y += (dy / distancia) * this.velocidade;
        }
    }

    // Função que verifica se houve a colisõa entre jogador e inimigo
    colidir(jogador) {
        const agora = Date.now();

        // Verifica se está colidindo e se já passou o intervalo de dano
        if (
            this.x < jogador.x + jogador.largura &&
            this.x + this.largura > jogador.x &&
            this.y < jogador.y + jogador.altura &&
            this.y + this.altura > jogador.y &&
            agora - this.ultimoDano > this.intervaloDano
        ) {
            jogador.dmg(this.dano);
            this.ultimoDano = agora; // Atualiza o tempo do último dano aplicado
        }
    }

    // Função que faz com que o inimigo receba dano, também chamando a função que faz o texto de dano ser desenhado
    receberDano(valor) {
        this.vida -= valor;
        
        const textoDano = new TextoDano(valor.toString(), this.x, this.y);
        jogo.textosDano.push(textoDano);
        
        if (this.vida <= 0) {
            // Lógica de destruição e drop
            this.destruido = true;
            const peca = new PecaMecanica(this.x, this.y, this.caminhoPeca, this.experiencia);
            jogo.PecaMecanica.push(peca); // Adiciona a peça ao jogo
            jogo.kills++;
        }
    }
}

// Classe do inimigo inicial, aqui está apenas os frames e como eles devem ser atualizados
class InimigoFraco extends Inimigo {
    constructor(x, y) {
        super(x, y, 26, 78, 30, 0.7, 2, 20, '../img/peca_fraca.png');

        // Carrega os sprite sheets para as direções esquerda e direita
        this.spriteDireita1 = new Image();
        this.spriteDireita1.src = "../img/Inimigo_fraco_direita_1_verde.png";
        this.spriteDireita2 = new Image();
        this.spriteDireita2.src = "../img/Inimigo_fraco_direita_2_verde.png";

        this.spriteEsquerda1 = new Image();
        this.spriteEsquerda1.src = "../img/Inimigo_fraco_esquerda_1_verde.png";
        this.spriteEsquerda2 = new Image();
        this.spriteEsquerda2.src = "../img/Inimigo_fraco_esquerda_2_verde.png";

        // Controle de animação
        this.direcao = 'direita'; // Começa assumindo que está olhando para a direita
        this.currentFrame = 1; // Inicia no primeiro frame
        this.tempoUltimaTroca = Date.now();
        this.intervaloTrocaFrame = 200; // Tempo entre trocas de frame, em milissegundos
    }

    atualizarFrame() {
        const agora = Date.now();
        if (agora - this.tempoUltimaTroca >= this.intervaloTrocaFrame) {
            this.currentFrame = this.currentFrame === 1 ? 2 : 1; // Alterna entre o frame 1 e 2
            this.tempoUltimaTroca = agora;
        }
    }

    mover(jogador) {
        let dx = jogador.x - this.x;
        this.direcao = dx >= 0 ? 'direita' : 'esquerda'; // Atualiza direção com base na posição do jogador
        super.mover(jogador);
    }

    desenha(cameraX, cameraY) {
        this.atualizarFrame();

        // Escolhe o sprite atual com base na direção e no frame atual
        let spriteAtual;
        if (this.direcao === 'direita') {
            spriteAtual = this.currentFrame === 1 ? this.spriteDireita1 : this.spriteDireita2;
        } else {
            spriteAtual = this.currentFrame === 1 ? this.spriteEsquerda1 : this.spriteEsquerda2;
        }

        // Desenha o sprite atual na posição correta no canvas
        ctx.drawImage(
            spriteAtual,
            this.x - cameraX,
            this.y - cameraY,
            this.largura,
            this.altura
        );
    }
}

// Classe do inimigo médio, aqui está apenas os frames e como eles devem ser atualizados
class Inimigomedio extends Inimigo{
    constructor(x,y){
        super(x,y,30,72, 40, 0.5, 5, 40, '../img/peca_media.png');
    
     // Carrega os sprite sheets para as direções esquerda e direita
     this.spriteDireita1 = new Image();
     this.spriteDireita1.src = "../img/Inimigo_medio_direita_1_verde_claro.png";
     this.spriteDireita2 = new Image();
     this.spriteDireita2.src = "../img/Inimigo_medio_direita_2_verde_claro.png";

     this.spriteEsquerda1 = new Image();
     this.spriteEsquerda1.src = "../img/Inimigo_medio_esquerda_1_verde_claro.png";
     this.spriteEsquerda2 = new Image();
     this.spriteEsquerda2.src = "../img/Inimigo_medio_esquerda_2_verde_claro.png";

     // Controle de animação
     this.direcao = 'direita'; // Começa assumindo que está olhando para a direita
     this.currentFrame = 1; // Inicia no primeiro frame
     this.tempoUltimaTroca = Date.now();
     this.intervaloTrocaFrame = 200; // Tempo entre trocas de frame, em milissegundos
 }

 atualizarFrame() {
     const agora = Date.now();
     if (agora - this.tempoUltimaTroca >= this.intervaloTrocaFrame) {
         this.currentFrame = this.currentFrame === 1 ? 2 : 1; // Alterna entre o frame 1 e 2
         this.tempoUltimaTroca = agora;
     }
 }

 mover(jogador) {
     let dx = jogador.x - this.x;
     this.direcao = dx >= 0 ? 'direita' : 'esquerda'; // Atualiza direção com base na posição do jogador
     super.mover(jogador);
 }

 desenha(cameraX, cameraY) {
     this.atualizarFrame();

     // Escolhe o sprite atual com base na direção e no frame atual
     let spriteAtual;
     if (this.direcao === 'direita') {
         spriteAtual = this.currentFrame === 1 ? this.spriteDireita1 : this.spriteDireita2;
     } else {
         spriteAtual = this.currentFrame === 1 ? this.spriteEsquerda1 : this.spriteEsquerda2;
     }

     // Desenha o sprite atual na posição correta no canvas
     ctx.drawImage(
         spriteAtual,
         this.x - cameraX,
         this.y - cameraY,
         this.largura,
         this.altura
     );
 }
}

// Classe do inimigo forte, aqui está apenas os frames e como eles devem ser atualizados
class Inimigoforte extends Inimigo{
    constructor(x,y){
        super(x,y,36,67, 50, 0.3, 10, 60,  '../img/peca_forte.png');
        
        // Carrega os sprite sheets para as direções esquerda e direita
     this.spriteDireita1 = new Image();
     this.spriteDireita1.src = "../img/Inimigo_forte_direita_1_vermelho.png";
     this.spriteDireita2 = new Image();
     this.spriteDireita2.src = "../img/Inimigo_forte_direita_2_vermelho.png";

     this.spriteEsquerda1 = new Image();
     this.spriteEsquerda1.src = "../img/Inimigo_forte_esquerda_1_vermelho.png";
     this.spriteEsquerda2 = new Image();
     this.spriteEsquerda2.src = "../img/Inimigo_forte_esquerda_2_vermelho.png";

     // Controle de animação
     this.direcao = 'direita'; // Começa assumindo que está olhando para a direita
     this.currentFrame = 1; // Inicia no primeiro frame
     this.tempoUltimaTroca = Date.now();
     this.intervaloTrocaFrame = 200; // Tempo entre trocas de frame, em milissegundos
 }

 atualizarFrame() {
     const agora = Date.now();
     if (agora - this.tempoUltimaTroca >= this.intervaloTrocaFrame) {
         this.currentFrame = this.currentFrame === 1 ? 2 : 1; // Alterna entre o frame 1 e 2
         this.tempoUltimaTroca = agora;
     }
 }

 mover(jogador) {
     let dx = jogador.x - this.x;
     this.direcao = dx >= 0 ? 'direita' : 'esquerda'; // Atualiza direção com base na posição do jogador
     super.mover(jogador);
 }

 desenha(cameraX, cameraY) {
     this.atualizarFrame();

     // Escolhe o sprite atual com base na direção e no frame atual
     let spriteAtual;
     if (this.direcao === 'direita') {
         spriteAtual = this.currentFrame === 1 ? this.spriteDireita1 : this.spriteDireita2;
     } else {
         spriteAtual = this.currentFrame === 1 ? this.spriteEsquerda1 : this.spriteEsquerda2;
     }

     // Desenha o sprite atual na posição correta no canvas
     ctx.drawImage(
         spriteAtual,
         this.x - cameraX,
         this.y - cameraY,
         this.largura,
         this.altura
        );
    }
}
    
// Classe principal de armas
class Arma {
    constructor(velocidade, framesAnimacao, forca) {
        this.velocidadeAtaque = velocidade; // Tempo entre ataques
        this.framesAnimacao = framesAnimacao; // Duração da animação de ataque
        this.forcaAtaque = forca; // Dano aplicado
        this.ultimoAtaque = Date.now(); // Tempo do último ataque
        this.ultimoDanoAplicado = Date.now(); // Controle do intervalo de dano
        this.atacando = false;
        this.framesAtaque = 0;
    }

    atualizar() {
        const tempoDesdeUltimoAtaque = Date.now() - this.ultimoAtaque;
        if (tempoDesdeUltimoAtaque > this.velocidadeAtaque) {
            this.atacando = true;
            this.ultimoAtaque = Date.now();
        }
        if (this.atacando) {
            this.framesAtaque += 1;
            if (this.framesAtaque >= this.framesAnimacao) {
                this.atacando = false;
                this.framesAtaque = 0;
            }
        }
    }

    aplicarDanoSeNoIntervalo(inimigo) {
        const tempoDesdeUltimoDano = Date.now() - this.ultimoDanoAplicado;
        if (tempoDesdeUltimoDano >= this.intervaloDano) {
            inimigo.receberDano(this.forcaAtaque);
            this.ultimoDanoAplicado = Date.now(); 
        }
    }

    desenhar() {}
}

// Arma que é adquirida no nível 3, a arma de dano em área do jogo
class Eletromagnetismo extends Arma {
    constructor() {
        super(1000, Infinity, 5);
        this.raio = 100; // Raio de alcance inicial
        this.imagem = new Image(); // Cria uma nova imagem
        this.imagem.src = '../img/eletromagnetismo_1.png'; // Pega a imagem da pasta img
        this.tempoRecargaInimigo = 1000; // Tempo de recarga individual para cada inimigo em milissegundos
        this.ultimoDanoInimigo = {}; // Armazena o último tempo de dano aplicado para cada inimigo
    }

    atualizar(jogador, inimigos) {
        const agora = Date.now();   
        
        for (const inimigo of inimigos) {
            const dx = jogador.x - inimigo.x;
            const dy = jogador.y - inimigo.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia <= this.raio) {
                // Verifica o tempo de recarga individual para cada inimigo
                if (agora - inimigo.ultimoDanoEletromagnetismo >= inimigo.intervaloDanoEletromagnetismo) {
                    inimigo.receberDano(this.forcaAtaque);
                    inimigo.ultimoDanoEletromagnetismo = agora; // Atualiza o último dano específico da arma Eletromagnetismo
                }
            }
        }
    }

    desenhar(jogador, cameraX, cameraY) {
        // Desenha a imagem ao redor do jogador, considerando a posição da câmera
        const x = jogador.x - cameraX - this.raio; // Ajusta a posição X
        const y = jogador.y - cameraY - this.raio; // Ajusta a posição Y
        const tamanho = this.raio * 2; // O tamanho da imagem deve ser o dobro do raio
    
        // Desenha a imagem
        ctx.drawImage(this.imagem, x + 14, y + 30, tamanho, tamanho);
    }
}

// A arma inicial do jogo, um laser que atira em direção ao inimigo mais próximo
class Laser extends Arma {
    constructor() {
        super(1000, 500, 15); // Tempo de recarga de 1 segundo, duração curta, dano de 10
        this.ultimoDisparo = 0; // Guarda o tempo do último disparo
        this.forcaAtaque = 15; // Valor inicial do dano
        this.tempoRecarga = 1000; // Define o intervalo de recarga em milissegundos (1 segundo)
        this.projeteis = []; // Lista para armazenar projéteis
        this.tamanhoProjetil = 40; // Comprimento do laser
        this.largura = 5; // Espessura do laser
    }


    aumentarDano(valor) {
        this.forcaAtaque += valor; // Aumenta o valor do dano
    }


    diminuirTempoRecarga(fator) { 
        this.tempoRecarga *= fator;  // Diminui o intervalo entre os disparos
    }

    
    disparar(jogador, inimigo) {
        const angulo = Math.atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
        this.projeteis.push({
            x: jogador.x,
            y: jogador.y,
            dx: Math.cos(angulo) * 5,
            dy: Math.sin(angulo) * 5,
            angulo: angulo,
            ativo: true
        });
        this.ultimoDisparo = Date.now();
    }


    atualizar(jogador, inimigos) {
        const agora = Date.now();

        // Verifica se o laser pode disparar
        if (agora - this.ultimoDisparo >= jogador.laser.tempoRecarga) {
            let inimigoMaisProximo = null;
            let menorDistancia = Infinity;

            for (const inimigo of inimigos) {
                const dx = inimigo.x - jogador.x;
                const dy = inimigo.y - jogador.y;
                const distancia = Math.sqrt(dx * dx + dy * dy);

                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    inimigoMaisProximo = inimigo;
                }
            }

            if (inimigoMaisProximo) {
                const angulo = Math.atan2(inimigoMaisProximo.y - jogador.y, inimigoMaisProximo.x - jogador.x);
                this.projeteis.push({
                    x: jogador.x,
                    y: jogador.y,
                    dx: Math.cos(angulo) * 5,
                    dy: Math.sin(angulo) * 5,
                    angulo: angulo,
                    ativo: true
                });
                this.ultimoDisparo = agora;
            }
        }

        // Atualiza projéteis
        for (let i = this.projeteis.length - 1; i >= 0; i--) {
            const proj = this.projeteis[i];
            proj.x += proj.dx;
            proj.y += proj.dy;

            // Verifica colisão com inimigos
            for (const inimigo of inimigos) {
                if (this.colisao(proj, inimigo)) {
                    inimigo.receberDano(jogador.laser.forcaAtaque);
                    proj.ativo = false; // Marca o projétil como inativo
                    break;
                }
            }

            // Remove projéteis inativos ou fora da área visível
            if (!proj.ativo || Math.abs(proj.x - jogador.x) > 1000 || Math.abs(proj.y - jogador.y) > 1000) {
                this.projeteis.splice(i, 1);
            }
        }
    }

    // Verifica a colisão do projétil com os inimigos
    colisao(proj, inimigo) {
        const laserX = proj.x + Math.cos(proj.angulo) * this.tamanhoProjetil / 2;
        const laserY = proj.y + Math.sin(proj.angulo) * this.tamanhoProjetil / 2;

        return (
            laserX > inimigo.x - inimigo.largura / 2 &&
            laserX < inimigo.x + inimigo.largura / 2 &&
            laserY > inimigo.y - inimigo.altura / 2 &&
            laserY < inimigo.y + inimigo.altura / 2
        );
    }


    desenhar(jogador, cameraX, cameraY) {
        for (const proj of this.projeteis) {
            ctx.save();
            ctx.translate(proj.x - cameraX, proj.y - cameraY);
            ctx.rotate(proj.angulo);

            ctx.beginPath();
            ctx.rect(0, -this.largura / 2, this.tamanhoProjetil, this.largura);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }
    }
}

// Classe principal do jogo
class Jogo {
    constructor() {
        // Define a imagem de fundo do jogo
        this.animacaoId = null; // ID da animação atual
        this.fundo = new Image();
        this.fundo.src = '../img/cenario.png'; // Imagem do cenario
        this.Eletromagnetismo = new Eletromagnetismo(); // Inicializa a arma de dano em área
        this.Laser = new Laser();// inicializa o laser 
        this.textosDano = []; // Lista para armazenar textos de dano   
        this.PecaMecanica = []; // Lista de peças no jogo 
        this.kills = 0; // Número de inimigos derrotados
        this.tempoSobrevivido = 0; // Tempo total sobrevivido em segundos
        // Inicializa as variáveis de estado do jogo
        this.inicializar(); 
    }

    // Inicializa todas as variaveis e cancela todas as animações anteriores, se necessário
    inicializar() {
        // Reinicia variáveis e estado do jogo
        this.jogador = new Jogador(mapa_largura / 2 - 100, mapa_altura / 2 - 50, 28, 60, 'yellow'); // Configura o jogador
        this.inimigos = []; // Armazena os inimigos atuais no jogo
        this.teclasPressionadas = {}; // Rastreamento de teclas pressionadas para movimentação
        this.tempoUltimoSpawn = 0; // Controle de tempo para spawnar inimigos
        this.ondaAtual = 1; // Número da onda atual de inimigos
        this.cameraX = 0; // Posição horizontal da câmera
        this.cameraY = 0; // Posição vertical da câmera
        this.gameOver = false; // Estado do jogo (se terminou ou não)
        this.tempoUltimoSpawn = 0; 
        this.ondaAtual = 1;
        this.animacaoId = null; 
        this.PecaMecanica = [];
        this.textosDano = [];
        this.kills = 0;
        this.tempoInicio = Date.now(); // Armazena o tempo de início do jogo

        if (this.animacaoId) {
            cancelAnimationFrame(this.animacaoId); // Cancela a animação anterior
        }
        
        // Remover evento de reiniciar se já existir (evitar duplicação)
        if (this.reiniciarHandler) {
            canvas.removeEventListener('click', this.reiniciarHandler);
        }

        // Define o handler para reiniciar o jogo
        this.reiniciarHandler = this.reiniciar.bind(this);
    }

    // Função que desenha a barra de experiencia dinâmica, que aumenta proporcionalmente com a experiência obtida
    desenharBarraExperiencia() {
        // Define as dimensões e posição da barra
        const larguraBarraTotal = canvas.width; // Barra ocupa toda a largura do canvas
        const alturaBarra = 20; // Altura da barra (ajustável)
        const xBarra = 0; // Começa no canto superior esquerdo
        const yBarra = 0; // Fica no topo da tela
    
        // Calcula a porcentagem da barra preenchida
        const porcentagemExperiencia = this.jogador.experiencia / this.jogador.experienciaNecessaria;
    
        // Desenha a barra de fundo
        ctx.fillStyle = 'grey'; // Cor do fundo da barra
        ctx.fillRect(xBarra, yBarra, larguraBarraTotal, alturaBarra);
    
        // Desenha a barra de progresso
        ctx.fillStyle = 'green'; // Cor da barra de progresso
        ctx.fillRect(xBarra, yBarra, larguraBarraTotal * porcentagemExperiencia, alturaBarra);
    }

    // Função para desenhar e atualizar o HUD do jogo, com informações vitais do jogo, como vida e tempo sobrevivido
    atualizarHUD() {
        // Atualiza o tempo sobrevivido
        this.tempoSobrevivido = Math.floor((Date.now() - this.tempoInicio) / 1000);

        // Desenha o HUD
        ctx.fillStyle = 'red';
        ctx.font = '20px helvetica';
        ctx.textAlign = 'left';

        // Desenha as informações
        ctx.fillText(`❤️: ${this.jogador.vidaMaxima}`, 5, 40); // Vida do jogador
        ctx.fillText(`💀: ${this.kills}`, 80, 40); // Kills
        ctx.fillText(`LV${this.jogador.nivel}`, 155, 40); // Nível do jogador
        ctx.fillText(`Tempo: ${String(this.tempoSobrevivido).padStart(2, '0')}`, 205, 40); // Tempo sobrevivido
    }

    // Efetivamente inicia o jogo
    iniciar() {
        // Inicia o jogo adicionando eventos de teclado uma única vez
        if (!this.jogoIniciado) {
            this.jogoIniciado = true;

            // Adiciona os listeners de teclado uma única vez
            document.addEventListener('keydown', (evento) => this.teclasPressionadas[evento.key] = true);
            document.addEventListener('keyup', (evento) => this.teclasPressionadas[evento.key] = false);
        }
        
        // Inicia a animação apenas se a imagem de fundo estiver carregada
        if (!this.animacaoId) {
            if (this.fundo.complete) {
                this.animacaoId = requestAnimationFrame(() => this.animacao());
            } else {
                this.fundo.onload = () => {
                    this.animacaoId = requestAnimationFrame(() => this.animacao());
                };
            }
        }
    }

    // Tela de game over
    exibirGameOver() {
        // Exibe tela de Game Over e adiciona opção para reiniciar
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Helvetica";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = "20px Helvetica";
        ctx.fillText("Clique para Jogar Novamente", canvas.width / 2, canvas.height / 2 + 20);

        // Adiciona evento de clique para reiniciar o jogo
        canvas.addEventListener('click', this.reiniciarHandler);
    }

    // Chama as funções de iniciar e inicializar, para fazer um efeito de reinicio do jogo
    reiniciar() {
        // Cancela a animação ativa e reinicia variáveis
        cancelAnimationFrame(this.animacaoId);
        this.inicializar();
        this.iniciar();
        this.gameOver = false; // Remove o estado de game over

        // Inicia a animação novamente
        if (this.fundo.complete) {
            this.animacaoId = requestAnimationFrame(() => this.animacao());
        } else {
            this.fundo.onload = () => {
                this.animacaoId = requestAnimationFrame(() => this.animacao());
            };
        }

        
    }

    // Chama a função de colisão
    verificarColisao(jogador, inimigo) {
        // Verifica e aplica dano se houver colisão entre jogador e inimigo
        inimigo.colidir(jogador);
    }  

    // Atualiza a camera dentro do jogo, sempre centralizando o jogador
    atualizarcamera() {
        // Ajusta a posição da câmera para manter o jogador no centro
        this.cameraX = Math.max(0, Math.min(this.jogador.x - visivel_largura / 2 + this.jogador.largura / 2, mapa_largura - visivel_largura));
        this.cameraY = Math.max(0, Math.min(this.jogador.y - visivel_altura / 2 + this.jogador.altura / 2, mapa_altura - visivel_altura));
    }

    // Função que invoca os inimigos, aumentando a quantidade durante o tempo da "RUN", além de chamar os tipos de inimigos
    spawnInimigos() {
        if (Date.now() - this.tempoUltimoSpawn < INTERVALO_ENTRE_ONDAS) return;
        if (this.inimigos.length >= MAX_INIMIGOS) return;
    
        const inimigosPorOnda = this.ondaAtual * 3;
        for (let i = 0; i < inimigosPorOnda; i++) {
            const raio = Math.random() * (1200 - 900) + 900; // Os inimigos são convocados em um circulo, fora da tela do jogador
            const angulo = Math.random() * (2 * Math.PI);
    
            const x = this.jogador.x + Math.cos(angulo) * raio;
            const y = this.jogador.y + Math.sin(angulo) * raio;
    
            this.inimigos.push(new InimigoFraco(x, y));
            if (this.ondaAtual >= 10){  // A partir da onda 10, os inimigos médios são chamados
            this.inimigos.push(new Inimigomedio(x, y));
            } 
            if (this.ondaAtual >= 15){  // A partir da onda 15, os inimigos fortes são chamados
            this.inimigos.push(new Inimigoforte(x, y));
            }
        }
    
        this.tempoUltimoSpawn = Date.now();
        this.ondaAtual++;
    }
    
    // Inicializa e chama todas as funções de gráficas do jogo
    animacao() {
        if (this.gameOver) {
            this.exibirGameOver();
            return;
        }
    
        this.atualizarcamera();
    
        ctx.clearRect(0, 0, visivel_largura, visivel_altura);
        ctx.drawImage(this.fundo, -this.cameraX, -this.cameraY, mapa_largura, mapa_altura);
    
        if (this.jogador.eletromagnetismo) {
            this.jogador.eletromagnetismo.atualizar(this.jogador, this.inimigos);
            this.jogador.eletromagnetismo.desenhar(this.jogador, this.cameraX, this.cameraY);
        }

        this.Laser.atualizar(this.jogador, this.inimigos);
        this.Laser.desenhar(this.jogador, this.cameraX, this.cameraY);

        this.atualizarHUD();

        this.desenharBarraExperiencia();

        // Atualiza e desenha textos de dano
        for (let i = this.textosDano.length - 1; i >= 0; i--) {
            const texto = this.textosDano[i];
            texto.atualizar();
            texto.desenhar(ctx, this.cameraX, this.cameraY); // Corrigida a chamada para o método da instância
    
            if (texto.destruir) {
                this.textosDano.splice(i, 1);
            }
        }
    
        if (Date.now() - this.tempoUltimoSpawn >= INTERVALO_ENTRE_ONDAS) {
            this.spawnInimigos();
        }
        

        for (let i = this.PecaMecanica.length - 1; i >= 0; i--) {
            const peca = this.PecaMecanica[i];
            peca.desenhar(this.cameraX, this.cameraY);
        
            // Verifica se o jogador está próximo o suficiente para atrair a peça
            const distancia = Math.sqrt((this.jogador.x - peca.x) ** 2 + (this.jogador.y - peca.y) ** 2);
            if (distancia < 100) {
                // Anima a peça movendo-se para o jogador
                peca.moverParaJogador(this.jogador);

                // tenta coletar a peça
                this.jogador.coletarPeca(this.PecaMecanica);

            }
        
            // Verifica se a peça foi coletada
            if (peca.coletada) {
                this.jogador.ganharExperiencia(peca.experiencia); // Ganha experiência
                this.PecaMecanica.splice(i, 1); // Remove a peça do jogo
            }
        }

        
        
        this.jogador.mover(this.teclasPressionadas);
        this.jogador.desenha(this.cameraX, this.cameraY);
    
        for (let i = this.inimigos.length - 1; i >= 0; i--) {
            const inimigo = this.inimigos[i];
            inimigo.mover(this.jogador);
            inimigo.desenha(this.cameraX, this.cameraY);
            
            this.verificarColisao(this.jogador, inimigo);
    
            if (inimigo.destruido) {
                this.inimigos.splice(i, 1);
            }
        }
    
        if (this.jogador.vidaMaxima <= 0) {
            this.gameOver = true;
        } else {
            this.animacaoId = requestAnimationFrame(() => this.animacao());
        }
    }    
}

// Inicializa o jogo e adiciona o evento ao botão "Jogar" sem chamar iniciar repetidamente
let jogo = new Jogo();
document.getElementById('startButton').addEventListener('click', () => {
    jogo.reiniciar(); // Reinicializa o jogo para evitar sobreposição de animações
});