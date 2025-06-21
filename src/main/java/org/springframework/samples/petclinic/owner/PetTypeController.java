package org.springframework.samples.petclinic.owner;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@Controller
public class PetTypeController {
    private final PetTypeRepository petTypeRepository;

    public PetTypeController(PetTypeRepository petTypeRepository) {
        this.petTypeRepository = petTypeRepository;
    }

    @GetMapping("/pet-types")
    public String listPetTypes(Model model) {
        List<PetType> petTypes = petTypeRepository.findPetTypes();
        model.addAttribute("petTypes", petTypes);
        return "petTypes";
    }
}
