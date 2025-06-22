// Project: petclinic
// 			pet.setType(petType);	

package org.springframework.samples.petclinic.pet;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PetTypeController {

	@GetMapping("/pet-types")
	public String showPetTypesPage() {
		return "petTypes";
	}

}
