package org.springframework.samples.petclinic.jira;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.lang.NonNull;
import java.io.InputStream;

@Configuration
@Profile({ "dev", "local", "test" })
public class NoOpMailConfig {

	@Bean
	public JavaMailSender javaMailSender() {
		return new JavaMailSender() {
			@Override
			public void send(@NonNull SimpleMailMessage simpleMessage) {
			}

			@Override
			public void send(@NonNull SimpleMailMessage... simpleMessages) {
			}

			@Override
			public void send(javax.mail.internet.MimeMessage mimeMessage) {
			}

			@Override
			public void send(javax.mail.internet.MimeMessage... mimeMessages) {
			}

			@Override
			public void send(MimeMessagePreparator mimeMessagePreparator) {
			}

			@Override
			public void send(MimeMessagePreparator... mimeMessagePreparators) {
			}

			@Override
			public javax.mail.internet.MimeMessage createMimeMessage() {
				return null;
			}

			@Override
			public javax.mail.internet.MimeMessage createMimeMessage(InputStream contentStream) {
				return null;
			}
		};
	}

}
