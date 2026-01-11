CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_weekly_availability_updated_at
  BEFORE UPDATE ON worker_weekly_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
