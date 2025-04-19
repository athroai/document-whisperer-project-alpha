
export interface CoreDecisionLog {
  id: string;
  user_id: string;
  timestamp: string;
  action: string;
  details: Record<string, any>;
}
