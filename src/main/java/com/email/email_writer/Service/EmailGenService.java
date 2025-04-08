package com.email.email_writer.Service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.email.email_writer.Controllers.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmailGenService {
	private final WebClient webClient;
	@Value("${gemini.api.url}")
	private String geminiApiUrl;
	
	@Value("${gemini.api.key}")
	private String geminiApiKey;
	
	public EmailGenService(WebClient.Builder webClientBuilder)
	{
		this.webClient=webClientBuilder.build();
	}
public String generateEmailReply(EmailRequest emailRequest)
{
	String prompt=buildPrompt(emailRequest);
	//generate request in the particular format
	Map<String,Object> requestBody=Map.of("contents",new Object[] {
	Map.of("parts",new Object[] {
		Map.of("text",prompt)})	
	});
	String response=webClient.post().
			uri(geminiApiUrl+geminiApiKey).
			header("Content-Type","application/json").
			bodyValue(requestBody).
			retrieve().
			bodyToMono(String.class).
			block();
	return extractResponseContent(response);
}

private String extractResponseContent(String response) {
	try {
		ObjectMapper mapper=new ObjectMapper();
		JsonNode rootnode=mapper.readTree(response);
		return rootnode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
		
	}
	catch(Exception ex)
	{
		ex.printStackTrace();
	}
	return null;
}
private String buildPrompt(EmailRequest emailRequest) {
    StringBuilder prompt = new StringBuilder();

    if ("compose".equalsIgnoreCase(emailRequest.getMode())) {
        prompt.append("Compose a new professional email. ");
        prompt.append("Please generate a complete email starting from salutation to closing.please dont add subject line ");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
        } else {
            prompt.append("Use a professional tone. ");
        }
        prompt.append("\nContext or instructions:\n").append(emailRequest.getEmailContent());
    } else { // default to reply
        prompt.append("Generate a professional email reply for the following email content. ");
        prompt.append("Please don't generate a subject line. Start directly from salutation. ");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
        } else {
            prompt.append("Use a professional tone. ");
        }
        prompt.append("\nOriginal email:\n").append(emailRequest.getEmailContent());
    }

    return prompt.toString();
}

}
