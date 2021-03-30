import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

const dialogflowURL = "https://us-central1-dialogflow-d683a.cloudfunctions.net/dialogflowGateway";

// const dialogflowURL = "http://localhost:5001/dialogflow-d683a/us-central1/dialogflowGateway";

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  messages:any[] = [];
  loading:boolean = false;

  sessionId = Math.random().toString(36).slice(-5);
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.addBotMessage('Hi. Thank you for reaching out to me. I can send you my resume or schedule an interview and more...');
  }

  handleUserMessage(event: any) {
    console.log(event);
    const text = event.message;
    this.addUserMessage(text);

    this.loading = true;

    // Make the request
    this.http.post<any>(
      dialogflowURL,
      {
        sessionId: this.sessionId,
        queryInput: {
          text: {
            text,
            languageCode: 'en-US'
          }
        }
      }
    )
      .subscribe(res => {
        const { fulfillmentText } = res;
        this.addBotMessage(fulfillmentText);
        this.loading = false;
      });
  }

  addUserMessage(text: string): void {
    // const sender: never = '';
    // const date: never = {};

    this.messages.push({
      text,
      sender: 'You',
      reply: true,
      date: new Date()
    });
  }

  addBotMessage(text: string): void {
    this.messages.push({
      text,
      sender: 'Bot',
      avatar: '/assets/bot.png',
      date: new Date(),
    });
  }


}
