package org.springframework.samples.petclinic.i18n;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Properties;

@RestController
@RequestMapping("/api/i18n")
public class I18nController {

	private static final String MESSAGES_PATH = "classpath:/messages/messages*.properties";

	private final LocaleResolver localeResolver;

	public I18nController(LocaleResolver localeResolver) {
		this.localeResolver = localeResolver;
	}

	@GetMapping("/available")
	public List<String> getAvailableLanguages() throws IOException {
		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		Resource[] resources = resolver.getResources(MESSAGES_PATH);
		List<String> langs = new ArrayList<>();
		for (Resource res : resources) {
			String filename = res.getFilename();
			if (filename == null)
				continue;
			// Skip the base messages.properties file, don't add "default"
			if (!filename.equals("messages.properties")) {
				String lang = filename.replace("messages_", "").replace(".properties", "");
				langs.add(lang);
			}
		}
		return langs;
	}

	@GetMapping("/{lang}")
	public ResponseEntity<Map<String, String>> getMessages(@PathVariable String lang) throws IOException {
		// Map "default" to German for backward compatibility
		String file = (lang.equals("default") || lang.equals("de")) ? "messages_de.properties"
				: "messages_" + lang + ".properties";
		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		Resource[] resources = resolver.getResources("classpath:/messages/" + file);
		if (resources.length == 0) {
			return ResponseEntity.notFound().build();
		}
		Properties props = new Properties();
		try (InputStream is = resources[0].getInputStream()) {
			props.load(new java.io.InputStreamReader(is, StandardCharsets.UTF_8));
		}
		Map<String, String> map = props.entrySet()
			.stream()
			.collect(Collectors.toMap(e -> String.valueOf(e.getKey()), e -> String.valueOf(e.getValue())));
		return ResponseEntity.ok(map);
	}

	@PostMapping("/setLocale/{lang}")
	public ResponseEntity<String> setLocale(@PathVariable String lang, HttpServletRequest request,
			HttpServletResponse response) {
		Locale locale;
		switch (lang) {
			case "de":
				locale = Locale.GERMAN;
				break;
			case "en":
				locale = Locale.ENGLISH;
				break;
			case "es":
				locale = new Locale("es");
				break;
			case "ru":
				locale = new Locale("ru");
				break;
			default:
				locale = Locale.GERMAN; // Default fallback
		}
		localeResolver.setLocale(request, response, locale);
		return ResponseEntity.ok("Locale set to " + lang);
	}

}
