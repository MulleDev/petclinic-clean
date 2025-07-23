package org.springframework.samples.petclinic.owner;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PetTypeController {

	@GetMapping({ "/pet-types", "/pettypes", "/pettypes.html" })
	public String redirectToAdmin() {
		return "redirect:/verwaltung/pettypes";
	}

}
