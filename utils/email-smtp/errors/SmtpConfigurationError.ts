import { ErrorProps, ExtensionError } from "../../Errors";

export class SmtpConfigurationError extends ExtensionError {
  constructor(options: ErrorProps) {
    super(options);
    this.code = 'smtp_configuration_error';
  }
}
