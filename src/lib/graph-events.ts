import type { GraphMutation } from './graph-mutations';

export interface GraphEvent {
  sequence: number;
  eventId: string;
  occurredAt: string;
  actor: string;
  mutation: GraphMutation;
}

export class GraphEventLog {
  private events: GraphEvent[] = [];

  append(actor: string, mutation: GraphMutation) {
    const event: GraphEvent = {
      sequence: this.events.length + 1,
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      actor,
      mutation
    };
    this.events.push(event);
    return event;
  }

  since(sequence: number, limit = 500) {
    return this.events.filter((event) => event.sequence > sequence).slice(0, limit);
  }

  latestSequence() {
    return this.events.at(-1)?.sequence ?? 0;
  }
}
