import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SurveyService, SurveyResponse } from '../../services/survey.service';

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
  private surveyService = inject(SurveyService);
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
  submitted = signal(false);
  submitting = signal(false);
  submittedMessage = signal('');

  responses = signal<SurveyResponse[]>([]);
  responsesLoading = signal(false);
  showResponses = signal(false);
  selectedResponse = signal<SurveyResponse | null>(null);
  deletingId = signal<string | null>(null);

  reflectionQuestions = [
    {
      key: "sentimiento",
      prompt: "¿Cómo te sentiste haciendo la prueba?",
      options: ["Tranquilo/a", "Algo nervioso/a", "Aburrido/a", "Confundido/a", "Entretenido/a"],
      multi: true,
      followup: "¿Hubo alguna pregunta que te costó responder? Cuéntame cuál y por qué."
    },
    {
      key: "duda",
      prompt: "¿Hubo alguna pregunta en la que dudaste mucho entre dos opciones?",
      options: ["Sí", "No"],
      multi: false,
      followupIf: ["Sí"],
      followup: "¿Cuál y por qué te costó decidir?"
    },
    {
      key: "representatividad",
      prompt: "¿Sentiste que alguna pregunta no representaba bien lo que realmente piensas o te gusta?",
      options: ["Sí", "No"],
      multi: false,
      followupIf: ["Sí"],
      followup: "¿Cuál pregunta y qué le cambiarías?"
    },
    {
      key: "honestidad",
      prompt: "¿Respondiste pensando en lo que realmente te gusta, o en lo que crees que deberías responder?",
      options: ["Lo que realmente me gusta", "Una mezcla de ambas", "Lo que creía que debía responder"],
      multi: false,
      followup: "¿Quieres agregar algo sobre esto?",
      followupOptional: true
    },
    {
      key: "familia",
      prompt: "¿Alguna respuesta la diste pensando en lo que tu familia espera de ti, en vez de lo que tú sientes?",
      options: ["Sí", "No", "A veces"],
      multi: false,
      followupIf: ["Sí", "A veces"],
      followup: "¿En qué pregunta notaste eso?"
    }
  ];

  reflectionStep = signal(0);
  reflectionAnswers = signal<{ selected: string[]; note: string }[]>(
    Array(5).fill(null).map(() => ({ selected: [], note: '' }))
  );
  reflectionSubmitted = signal(false);
  showReflection = signal(false);
  reflectionTouched = signal(false);
  lastSubmittedResponseId = signal<string | null>(null);
  reflectionsSaved = signal(false);
  selectedReflection = signal<{ response: SurveyResponse; reflection: SurveyResponse['reflection'] } | null>(null);

  get currentQuestion() {
    return this.questions[this.currentIndex()];
  }

  responseId(response: SurveyResponse) {
    return response._id || response.id || '';
  }

  get progress() {
    const answered = this.answers().filter((a) => a !== null).length;
    return {
      current: this.currentIndex() + 1,
      total: this.questions.length,
      percent: Math.round((answered / this.questions.length) * 100)
    };
  }

  isAnswered() {
    return this.answers()[this.currentIndex()] !== null;
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

  submitSurvey() {
    const answers = this.answers()
      .map((value, index) => ({
        questionIndex: index,
        question: this.questions[index],
        value: value as string
      }))
      .filter((a) => a.value !== null);

    if (answers.length === 0) {
      this.submittedMessage.set('No hay respuestas para enviar');
      return;
    }

    this.submitting.set(true);
    this.submittedMessage.set('');
    this.surveyService.submitResponse(answers).subscribe({
      next: (data: any) => {
        this.submitted.set(true);
        this.submitting.set(false);
        this.submittedMessage.set('Respuesta guardada correctamente');
        this.lastSubmittedResponseId.set(data?.response?._id || null);
        this.showReflection.set(true);
        this.reflectionStep.set(0);
        this.reflectionAnswers.set(Array(5).fill(null).map(() => ({ selected: [], note: '' })));
        this.reflectionSubmitted.set(false);
      },
      error: () => {
        this.submitting.set(false);
        this.submittedMessage.set('Error al guardar la respuesta');
      }
    });
  }

  reflectionSelect(stepIndex: number, option: string) {
    const q = this.reflectionQuestions[stepIndex];
    this.reflectionAnswers.update((current) => {
      const next = [...current];
      const ans = { ...next[stepIndex] };
      if (q.multi) {
        const idx = ans.selected.indexOf(option);
        if (idx >= 0) ans.selected.splice(idx, 1);
        else ans.selected.push(option);
      } else {
        ans.selected = ans.selected[0] === option ? [] : [option];
      }
      next[stepIndex] = ans;
      return next;
    });
  }

  reflectionNote(stepIndex: number, value: string) {
    this.reflectionAnswers.update((current) => {
      const next = [...current];
      next[stepIndex] = { ...next[stepIndex], note: value };
      return next;
    });
  }

  reflectionNext() {
    this.reflectionTouched.set(true);
    const ans = this.reflectionAnswers()[this.reflectionStep()];
    if (ans.selected.length === 0) return;
    if (this.reflectionStep() < this.reflectionQuestions.length - 1) {
      this.reflectionStep.update((i) => i + 1);
      this.reflectionTouched.set(false);
    } else {
      this.reflectionSubmitted.set(true);
    }
  }

  reflectionBack() {
    if (this.reflectionStep() > 0) {
      this.reflectionStep.update((i) => i - 1);
    }
  }

  closeReflection() {
    this.showReflection.set(false);
    const raw = this.reflectionQuestions.map((q, i) => {
      const ans = this.reflectionAnswers()[i];
      return { key: q.key, prompt: q.prompt, selected: [...ans.selected], note: ans.note };
    });
    const currentResponseId = this.lastSubmittedResponseId();
    if (!currentResponseId) {
      this.authService.logout();
      return;
    }
    if (!raw.length) {
      this.authService.logout();
      return;
    }
    this.submitting.set(true);
    this.surveyService.saveReflection(currentResponseId, raw).subscribe({
      next: () => {
        this.reflectionsSaved.set(true);
        this.responses.update((current) => current.map((r) => r._id === currentResponseId ? { ...r, reflection: raw } : r));
        this.submittedMessage.set('Reflexión guardada correctamente');
        this.submitting.set(false);
        this.authService.logout();
      },
      error: () => {
        this.submittedMessage.set('Error al guardar la reflexión');
        this.submitting.set(false);
        this.authService.logout();
      }
    });
  }

  viewReflectionDetail(response: SurveyResponse) {
    this.selectedReflection.set({ response, reflection: response.reflection || [] });
  }

  closeReflectionDetail() {
    this.selectedReflection.set(null);
  }

  reflectionStepData() {
    return this.reflectionQuestions[this.reflectionStep()];
  }

  reflectionShouldShowFollowup(stepIndex: number) {
    const q = this.reflectionQuestions[stepIndex];
    const ans = this.reflectionAnswers()[stepIndex];
    if (!q.followup) return false;
    if (q.followupOptional) return true;
    if (!q.followupIf) return true;
    const targets = Array.isArray(q.followupIf) ? q.followupIf : [q.followupIf];
    return ans.selected.some((s) => targets.includes(s));
  }

  copyReflection() {
    const text = this.reflectionQuestions.map((q, i) => {
      const ans = this.reflectionAnswers()[i];
      let line = `${q.prompt}\n${ans.selected.join(', ')}`;
      if (ans.note) line += `\nNota: ${ans.note}`;
      return line;
    }).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyReflectionBtn');
      if (btn) {
        btn.textContent = 'Copiado';
        setTimeout(() => { btn.textContent = 'Copiar respuestas'; }, 2000);
      }
    });
  }

  retakeSurvey() {
    if (this.submitted()) return;
    this.currentIndex.set(0);
    this.answers.set(Array(48).fill(null));
    this.submitted.set(false);
    this.submittedMessage.set('');
  }

  loadResponses() {
    this.responsesLoading.set(true);
    this.showResponses.set(true);
    this.selectedResponse.set(null);
    this.surveyService.getAllResponses().subscribe({
      next: (data) => {
        this.responses.set(data.map(r => ({ ...r, _id: r._id ?? r.id })));
        this.responsesLoading.set(false);
      },
      error: () => {
        this.responsesLoading.set(false);
      }
    });
  }

  closeResponses() {
    this.showResponses.set(false);
    this.selectedResponse.set(null);
  }

  viewDetail(response: SurveyResponse) {
    this.selectedResponse.set(null);
    this.surveyService.getResponseById(this.responseId(response)).subscribe({
      next: (fullResponse) => {
        this.selectedResponse.set(fullResponse);
      },
      error: () => {
        this.selectedResponse.set(null);
      }
    });
  }

  closeDetail() {
    this.selectedResponse.set(null);
  }

  deleteResponse(id: string) {
    if (!confirm('¿Eliminar esta respuesta?')) {
      return;
    }
    this.deletingId.set(id);
    this.surveyService.deleteResponse(id).subscribe({
      next: () => {
        this.responses.update((current) => current.filter((r) => r._id !== id));
        if (this.selectedResponse()?._id === id) {
          this.selectedResponse.set(null);
        }
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
      }
    });
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
    this.showResponses.set(false);
    this.selectedResponse.set(null);
    this.showReflection.set(false);
    this.selectedReflection.set(null);
    this.authService.logout();
  }
}
