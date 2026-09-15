import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface SurveyAnswer {
  questionIndex: number;
  question: string;
  value: string;
}

export interface SurveyResponse {
  _id?: string;
  id?: string;
  userId: string;
  username: string;
  answers: SurveyAnswer[];
  answersCount: number;
  submittedAt: string;
  createdAt: string;
  reflection?: { key: string; prompt: string; selected: string[]; note: string }[];
}

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private apiUrl = 'https://backendorientacionvocacional.onrender.com/api/responses';
  //private apiUrl = 'http://localhost:3000/api/responses';
  constructor(private http: HttpClient, private authService: AuthService) {}

  submitResponse(answers: SurveyAnswer[]) {
    return this.http.post(this.apiUrl, { answers });
  }

  getAllResponses() {
    return this.http.get<SurveyResponse[]>(this.apiUrl);
  }

  deleteResponse(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getResponseById(id: string) {
    return this.http.get<SurveyResponse>(`${this.apiUrl}/${id}`);
  }

  saveReflection(id: string, reflection: SurveyResponse['reflection']) {
    return this.http.patch(`${this.apiUrl}/${id}/reflection`, { reflection });
  }
}
