package org.springframework.samples.petclinic.jira;

import java.util.HashMap;
import java.util.Map;

/**
 * Konfigurierbares Mapping von KI-Feldern zu Jira-Customfields. Kann für neue Felder
 * einfach erweitert werden.
 */
public class JiraFieldMappingConfig {

	private static final Map<String, String> KI_TO_JIRA_FIELD_MAP = new HashMap<>();
	static {
		KI_TO_JIRA_FIELD_MAP.put("acceptanceCriteria", "customfield_10010");
		KI_TO_JIRA_FIELD_MAP.put("epicLink", "customfield_10008");
		// Weitere Mappings hier ergänzen
	}

	public static String getJiraField(String kiField) {
		return KI_TO_JIRA_FIELD_MAP.get(kiField);
	}

	public static boolean isMapped(String kiField) {
		return KI_TO_JIRA_FIELD_MAP.containsKey(kiField);
	}

	public static Map<String, String> getAllMappings() {
		return KI_TO_JIRA_FIELD_MAP;
	}

}
