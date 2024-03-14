import { Allow } from 'class-validator';

export class UpdateProjectWebDashboardDto {
  @Allow()
  webDashboard: any;
}
