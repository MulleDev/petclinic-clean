package org.springframework.samples.petclinic.controller.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.samples.petclinic.model.Vet;
import org.springframework.samples.petclinic.repository.VetRepository;

@Controller
@RequestMapping("/verwaltung/vets")
public class VetAdminController {

	private final VetRepository vetRepository;

	@Autowired
	public VetAdminController(VetRepository vetRepository) {
		this.vetRepository = vetRepository;
	}

	@GetMapping
	public String list(Model model) {
		model.addAttribute("vets", vetRepository.findAll());
		return "verwaltung/vets/list";
	}

	@GetMapping("/new")
	public String createForm(Model model) {
		model.addAttribute("vetForm", new VetForm());
		model.addAttribute("formAction", "/verwaltung/vets/new");
		return "verwaltung/vets/form";
	}

	@PostMapping("/new")
	public String create(@Valid @ModelAttribute("vetForm") VetForm vetForm, BindingResult result,
			RedirectAttributes redirectAttributes, Model model) {
		if (result.hasErrors()) {
			model.addAttribute("vetForm", vetForm);
			model.addAttribute("formAction", "/verwaltung/vets/new");
			return "verwaltung/vets/form";
		}
		Vet vet = vetForm.toVet();
		vetRepository.save(vet);
		redirectAttributes.addFlashAttribute("success", "vet.saved");
		return "redirect:/verwaltung/vets";
	}

	@GetMapping("/{id}/edit")
	public String editForm(@PathVariable Integer id, Model model) {
		Vet vet = vetRepository.findById(id);
		if (vet == null) {
			return "redirect:/verwaltung/vets";
		}
		model.addAttribute("vetForm", VetAdminController.VetForm.fromVet(vet));
		model.addAttribute("formAction", "/verwaltung/vets/" + id + "/edit");
		return "verwaltung/vets/form";
	}

	@PostMapping("/{id}/edit")
	public String edit(@PathVariable Integer id, @Valid @ModelAttribute("vetForm") VetForm vetForm,
			BindingResult result, RedirectAttributes redirectAttributes, Model model) {
		if (result.hasErrors()) {
			model.addAttribute("vetForm", vetForm);
			model.addAttribute("formAction", "/verwaltung/vets/" + id + "/edit");
			return "verwaltung/vets/form";
		}
		Vet vet = vetForm.toVet();
		vet.setId(id);
		vetRepository.save(vet);
		redirectAttributes.addFlashAttribute("success", "vet.saved");
		return "redirect:/verwaltung/vets";
	}

	@PostMapping("/{id}/delete")
	public String delete(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
		Vet vet = vetRepository.findById(id);
		if (vet != null) {
			vetRepository.delete(vet);
			redirectAttributes.addFlashAttribute("success", "vet.deleted");
		}
		else {
			redirectAttributes.addFlashAttribute("error", "vet.notfound");
		}
		return "redirect:/verwaltung/vets";
	}

	// --- Form DTO with validation ---
	public static class VetForm {

		@NotBlank(message = "vet.firstname.required")
		private String firstName;

		@NotBlank(message = "vet.lastname.required")
		private String lastName;

		@Email(message = "vet.email.invalid")
		private String email;

		@Pattern(regexp = "^\\d*$", message = "vet.telephone.digits")
		private String telephone;

		// Getter/Setter ...
		public String getFirstName() {
			return firstName;
		}

		public void setFirstName(String firstName) {
			this.firstName = firstName;
		}

		public String getLastName() {
			return lastName;
		}

		public void setLastName(String lastName) {
			this.lastName = lastName;
		}

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}

		public String getTelephone() {
			return telephone;
		}

		public void setTelephone(String telephone) {
			this.telephone = telephone;
		}

		public Vet toVet() {
			Vet vet = new Vet();
			vet.setFirstName(firstName);
			vet.setLastName(lastName);
			vet.setEmail(email);
			vet.setTelephone(telephone);
			return vet;
		}

		public static VetForm fromVet(Vet vet) {
			VetForm form = new VetForm();
			form.setFirstName(vet.getFirstName());
			form.setLastName(vet.getLastName());
			form.setEmail(vet.getEmail());
			form.setTelephone(vet.getTelephone());
			return form;
		}

	}

}
