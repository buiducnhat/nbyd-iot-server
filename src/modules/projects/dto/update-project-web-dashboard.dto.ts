import { Allow, IsOptional } from 'class-validator';

export class UpdateProjectDashboardDto {
  @Allow()
  @IsOptional()
  webDashboard?: any;

  @Allow()
  @IsOptional()
  mobileDashboard?: any;
}
