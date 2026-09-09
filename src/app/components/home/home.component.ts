import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  showInstructions = signal(false);
  private countdown?: number;

  questions = [
    'Reparar o construir objetos utilizando herramientas.',
    'Trabajar con máquinas, equipos o dispositivos tecnológicos.',
    'Realizar actividades que impliquen trabajo manual o físico.',
    'Aprender a utilizar herramientas, máquinas o equipos especializados.',
    'Preferir aprender haciendo cosas prácticas, más que leyendo teoría.',
    'Trabajar al aire libre, en talleres, obras o espacios técnicos.',
    'Armar, desarmar o ajustar dispositivos para entender cómo funcionan.',
    'Cultivar plantas, cuidar animales o trabajar en actividades agropecuarias.',
    'Investigar por qué ocurre un fenómeno científico.',
    'Resolver problemas utilizando la lógica y el análisis.',
    'Hacer experimentos para descubrir cómo funciona algo.',
    'Analizar información para encontrar soluciones a un problema.',
    'Leer sobre temas científicos, tecnológicos o de investigación.',
    'Formular hipótesis y comprobarlas con datos o evidencia.',
    'Resolver acertijos, problemas matemáticos o retos lógicos.',
    'Programar, codificar o trabajar con sistemas informáticos.',
    'Crear dibujos, diseños, fotografías o ilustraciones.',
    'Escribir historias, poemas o textos creativos.',
    'Crear contenido para redes sociales, videos o medios digitales.',
    'Diseñar espacios, objetos, logotipos o piezas visuales.',
    'Disfrutar actividades relacionadas con música, arte, teatro o diseño.',
    'Expresar ideas o emociones a través de medios artísticos.',
    'Improvisar, actuar o participar en producciones creativas.',
    'Buscar formas originales o poco convencionales de resolver algo.',
    'Ayudar a una persona que tiene un problema.',
    'Explicar un tema para ayudar a otra persona a comprenderlo.',
    'Participar en actividades de voluntariado o servicio comunitario.',
    'Escuchar y orientar a alguien que necesita apoyo.',
    'Trabajar enseñando, acompañando o cuidando a otras personas.',
    'Trabajar en equipo priorizando el bienestar del grupo.',
    'Mediar en conflictos entre otras personas.',
    'Sentir satisfacción al ver que ayudaste a alguien a mejorar.',
    'Dirigir un grupo para alcanzar una meta.',
    'Convencer a otras personas de apoyar una idea o proyecto.',
    'Planear un negocio o una iniciativa propia.',
    'Hablar en público para presentar y defender una propuesta.',
    'Tomar decisiones y asumir responsabilidades dentro de un equipo.',
    'Negociar acuerdos o resolver desacuerdos para lograr un objetivo.',
    'Asumir riesgos calculados para lograr una meta ambiciosa.',
    'Motivar o influir en otros para que actúen de cierta manera.',
    'Organizar documentos, archivos o información.',
    'Llevar registros, listas o bases de datos.',
    'Revisar información para encontrar errores y corregirlos.',
    'Planificar y organizar actividades siguiendo un orden establecido.',
    'Trabajar con números, documentos o información organizada.',
    'Seguir procedimientos claros y bien establecidos.',
    'Elaborar presupuestos, cuentas o reportes detallados.',
    'Mantener el orden y el control en tareas administrativas.'
  ];

  currentIndex = signal(0);
  answers = signal<(string | null)[]>(Array(48).fill(null));

  get currentQuestion() {
    return this.questions[this.currentIndex()];
  }

  get progress() {
    const answered = this.answers().filter((a) => a !== null).length;
    return {
      current: this.currentIndex() + 1,
      total: this.questions.length,
      percent: Math.round((answered / this.questions.length) * 100)
    };
  }

  selectAnswer(value: string) {
    this.answers.update((current) => {
      const next = [...current];
      next[this.currentIndex()] = value;
      return next;
    });
  }

  next() {
    if (this.currentIndex() < this.questions.length - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  previous() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  get user() {
    return this.authService.user();
  }

  ngOnInit() {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('showInstructions') === 'true') {
      sessionStorage.removeItem('showInstructions');
      this.showInstructions.set(true);
      this.countdown = window.setTimeout(() => {
        this.showInstructions.set(false);
      }, 6000);
    }
  }

  ngOnDestroy() {
    if (this.countdown) {
      clearTimeout(this.countdown);
    }
  }

  closeInstructions() {
    if (this.countdown) {
      clearTimeout(this.countdown);
    }
    this.showInstructions.set(false);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
  }
}
