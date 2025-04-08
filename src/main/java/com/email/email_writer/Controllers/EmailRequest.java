package com.email.email_writer.Controllers;

import lombok.Data;
@Data
public class EmailRequest {
	private String emailContent;
	private String tone;
	private String mode;


}
