package org.springframework.samples.petclinic.i18n;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.Properties;

@RestController
@RequestMapping("/api/i18n")
public class I18nController {

	private static final String MESSAGES_PATH = "classpath:/messages/messages*.properties";

	@GetMapping("/available")
	public List<String> getAvailableLanguages() throws IOException {
		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		Resource[] resources = resolver.getResources(MESSAGES_PATH);
		List<String> langs = new ArrayList<>();
		for (Resource res : resources) {
			String filename = res.getFilename();
			if (filename == null)
				continue;
			if (filename.equals("messages.properties")) {
				langs.add("default");
			}
			else {
				String lang = filename.replace("messages_", "").replace(".properties", "");
				langs.add(lang);
			}
		}
		return langs;
	}

	@GetMapping("/{lang}")
	public ResponseEntity<Map<String, String>> getMessages(@PathVariable String lang) throws IOException {
		String file = lang.equals("default") ? "messages.properties" : "messages_" + lang + ".properties";
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

}
