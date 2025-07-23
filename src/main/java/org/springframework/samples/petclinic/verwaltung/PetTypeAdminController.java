package org.springframework.samples.petclinic.verwaltung;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.samples.petclinic.owner.PetType;
import org.springframework.samples.petclinic.owner.PetTypeRepository;

import java.util.Optional;

@Controller
@RequestMapping("/verwaltung/pettypes")
public class PetTypeAdminController {

	private final PetTypeRepository petTypeRepository;

	@Autowired
	public PetTypeAdminController(PetTypeRepository petTypeRepository) {
		this.petTypeRepository = petTypeRepository;
	}

	@GetMapping
	public String list(Model model) {
		model.addAttribute("petTypes", petTypeRepository.findPetTypes());
		return "verwaltung/pettypes/list";
	}

	@GetMapping("/new")
	public String createForm(Model model) {
		model.addAttribute("petType", new PetType());
		return "verwaltung/pettypes/form";
	}

	@PostMapping("/new")
	public String create(@Valid @ModelAttribute PetType petType, BindingResult result,
			RedirectAttributes redirectAttributes, Model model) {
		if (result.hasErrors()) {
			model.addAttribute("petType", petType);
			return "verwaltung/pettypes/form";
		}
		petTypeRepository.save(petType);
		redirectAttributes.addFlashAttribute("success", "pettype.saved");
		return "redirect:/verwaltung/pettypes";
	}

	@GetMapping("/{id}/edit")
	public String editForm(@PathVariable Integer id, Model model) {
		Optional<PetType> petType = petTypeRepository.findById(id);
		if (petType.isEmpty()) {
			return "redirect:/verwaltung/pettypes";
		}
		model.addAttribute("petType", petType.get());
		return "verwaltung/pettypes/form";
	}

	@PostMapping("/{id}/edit")
	public String edit(@PathVariable Integer id, @Valid @ModelAttribute PetType petType, BindingResult result,
			RedirectAttributes redirectAttributes, Model model) {
		if (result.hasErrors()) {
			model.addAttribute("petType", petType);
			return "verwaltung/pettypes/form";
		}
		petType.setId(id);
		petTypeRepository.save(petType);
		redirectAttributes.addFlashAttribute("success", "pettype.saved");
		return "redirect:/verwaltung/pettypes";
	}

	@PostMapping("/{id}/delete")
	public String delete(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
		Optional<PetType> petType = petTypeRepository.findById(id);
		if (petType.isPresent()) {
			petTypeRepository.delete(petType.get());
			redirectAttributes.addFlashAttribute("success", "pettype.deleted");
		}
		else {
			redirectAttributes.addFlashAttribute("error", "pettype.notfound");
		}
		return "redirect:/verwaltung/pettypes";
	}

}
