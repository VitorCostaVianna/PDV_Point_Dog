package point.dog;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.github.anastaciocintra.output.PrinterOutputStream;

@SpringBootApplication
public class SistemaGerenciamentoPointDogApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaGerenciamentoPointDogApplication.class, args);
	}

	@Bean
	public CommandLineRunner listarImpressoras() {
		return args -> {
			System.out.println("=== IMPRESSORAS DETECTADAS PELO JAVA ===");
			String[] printServicesNames = PrinterOutputStream.getListPrintServicesNames();
			for (String printServiceName : printServicesNames) {
				System.out.println(" -> " + printServiceName);
			}
			System.out.println("========================================");
		};
	}

}
