package com.email.email_writer.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.email.email_writer.Service.EmailGenService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/email")
//@AllArgsConstructor
@CrossOrigin(origins="*")
public class EmailGenController {
	private final EmailGenService emailService;
	public EmailGenController(EmailGenService emailService) {
        this.emailService = emailService;
    }
	@PostMapping("/generate")
public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest)
{
		String response=emailService.generateEmailReply(emailRequest);
	return ResponseEntity.ok(response);
}
}
