# Spring PetClinic - LLM-Driven Development Project

[![Build Status](https://github.com/spring-projects/spring-petclinic/actions/workflows/maven-build.yml/badge.svg)](https://github.com/spring-projects/spring-petclinic/actions/workflows/maven-build.yml)[![Build Status](https://github.com/spring-projects/spring-petclinic/actions/workflows/gradle-build.yml/badge.svg)](https://github.com/spring-projects/spring-petclinic/actions/workflows/gradle-build.yml)

## 🤖 Project Overview

This is a **100% LLM-driven development project** that demonstrates modern AI-assisted software development using advanced tooling and automation. The project showcases how Large Language Models can completely restructure, test, and deploy complex Spring Boot applications.

### 🚀 **LLM & AI Technologies:**
- **🧠 Large Language Model Development**: Complete codebase restructuring through AI prompting
- **🔗 Model Context Protocol (MCP)**: Advanced AI-human collaboration workflows
- **🎭 Playwright Test Automation**: AI-generated end-to-end testing strategies
- **⚡ Automated Code Refactoring**: LLM-driven package restructuring to Spring Boot Best Practices
- **🤖 AI-Powered Deployment**: Automated Railway deployment through intelligent decision-making

### 🎯 **What Makes This Project Special:**
- **Pure LLM Development**: Entire codebase modernization achieved through AI conversation
- **MCP Integration**: Advanced Model Context Protocol for sophisticated AI workflows  
- **Intelligent Testing**: Playwright tests designed and implemented by AI
- **Smart Architecture**: LLM-guided migration to Spring Boot Best Practices
- **AI DevOps**: Complete CI/CD pipeline setup through intelligent automation

## 🌐 Live Application & AI Demonstration

🚀 **Live Demo**: [https://pet-clinic-llm-production.up.railway.app](https://pet-clinic-llm-production.up.railway.app)

This live application serves as a **proof-of-concept for LLM-driven development**, showcasing:
- Complete architecture restructuring achieved through AI conversation
- Railway deployment configured entirely through LLM guidance
- Playwright E2E tests designed and implemented by AI
- Modern Spring Boot Best Practices applied through intelligent code analysis

### 🔬 **AI Development Showcase:**
- **🎯 Automated Refactoring**: Traditional domain-based → Modern layered architecture
- **🧪 Intelligent Testing**: 75+ passing tests with AI-generated test strategies
- **🚀 Smart Deployment**: Heroku → Railway migration through AI decision-making
- **📚 Dynamic Documentation**: This README created and maintained by LLM

## 🛠️ LLM Development Journey & Technical Achievements

This project represents a **revolutionary approach to software development** where an AI assistant completely modernized a Spring Boot application through conversational programming.

### 🤖 **LLM-Driven Development Process:**
- **🔄 Package Restructuring**: AI analyzed and reorganized entire codebase to Spring Boot Best Practices
- **🎭 Test Automation**: Playwright testing framework implemented through AI-guided development
- **🚀 Cloud Migration**: Intelligent platform selection and deployment (Heroku → Railway)
- **📋 MCP Integration**: Model Context Protocol used for advanced AI-human collaboration
- **🔧 Code Quality**: Automated formatting, validation, and error resolution through AI

### ✨ **Key Technical Features:**
- **Modern Architecture**: LLM-guided Traditional Layered Architecture implementation
- **Package Structure**: AI-optimized separation of concerns with proper layering
- **Railway Deployment**: Intelligent cloud platform selection for optimal performance
- **Comprehensive Testing**: 75+ AI-generated tests with Playwright E2E automation
- **Multi-language Support**: Internationalization maintained through intelligent refactoring

### Package Structure (Spring Boot Best Practices):
```
src/main/java/org/springframework/samples/petclinic/
├── config/          # Configuration classes
├── controller/      # Web layer
│   ├── admin/       # Admin-specific controllers
│   └── rest/        # REST API controllers
├── model/           # Domain entities and data models
├── repository/      # Data access layer
├── validation/      # Custom validation logic
└── formatter/       # Custom formatters and converters
```

### Deployment Information:
- **Platform**: Railway (migrated from Heroku for better performance)
- **Live URL**: https://pet-clinic-llm-production.up.railway.app
- **Deployment Method**: Git-based automatic deployments
- **Build Tool**: Maven with spring-javaformat plugin

## Playwright End-to-End Testing

This project includes comprehensive E2E testing with Playwright, configured to test against both local and deployed instances.

### Test Configuration:
- **Live Testing**: Tests are configured to run against the Railway deployment
- **Local Testing**: Can be configured to test against `http://localhost:8080`
- **Test Location**: `playwright/tests/` directory
- **Test Data**: Fixtures available in `playwright/fixtures/`

### Running Playwright Tests:
```bash
# Install Playwright dependencies
cd playwright
npm install

# Run tests against live deployment
npx playwright test

# Run tests with UI mode
npx playwright test --ui

# View test report
npx playwright show-report
```

### CI/CD & Deployment:
- **Platform**: Railway with Git-based deployments
- **Process**: Push to main branch triggers automatic deployment
- **Build**: Maven with spring-javaformat for code quality
- **Monitoring**: Railway provides built-in application monitoring

## Running the Application Locally

This modernized Spring Boot application can be run locally for development and testing.

### Quick Start:
```bash
# Clone and navigate to the project
git clone <your-repository-url>
cd PetClinic

# Run the application
./mvnw spring-boot:run
```

### Alternative Methods:
```bash
# Build and run JAR
./mvnw package
java -jar target/*.jar

# Using Gradle (if preferred)
./gradlew build
java -jar build/libs/*.jar
```

Access the application at: **http://localhost:8080**

### Development Features:
- **Hot Reload**: Spring Boot DevTools enabled for immediate code changes
- **H2 Console**: Available at `http://localhost:8080/h2-console` for database inspection
- **Code Formatting**: Automatic formatting with spring-javaformat plugin
- **Multi-Profile Support**: Switch between H2, MySQL, and PostgreSQL databases

## Railway Deployment Setup

This application is deployed on Railway, providing fast and reliable cloud hosting.

### Initial Setup:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to existing project (if already deployed)
railway link

# Or create new project
railway login
railway init
```

### Deployment Process:
```bash
# Deploy current branch
railway up

# Or simply push to main branch for automatic deployment
git push origin main
```

### Railway Features:
- **Automatic Builds**: Detects Maven/Java projects automatically
- **Environment Variables**: Managed through Railway dashboard
- **Custom Domains**: HTTPS enabled by default
- **Monitoring**: Built-in metrics and logging
- **Zero Downtime**: Rolling deployments

### Environment Configuration:
Railway automatically detects the Maven project and uses:
- Java 17+ runtime
- Maven build process
- Port binding from `$PORT` environment variable
- Health checks via Spring Boot Actuator

## Building a Container

The application can be containerized using Spring Boot's built-in support:

```bash
# Build container image with Maven
./mvnw spring-boot:build-image

# Or create custom Dockerfile if needed
docker build -t petclinic .
docker run -p 8080:8080 petclinic
```

Railway supports both buildpack and Docker deployments automatically.

## Database Configuration

The application supports multiple database configurations through Spring profiles:

### Default Configuration (H2):
- **In-Memory Database**: H2 database populated at startup
- **H2 Console**: Available at `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:<uuid>` (UUID printed at startup)
- **Profile**: Default (no profile needed)

### Production Databases:
```bash
# MySQL Profile
./mvnw spring-boot:run -Dspring.profiles.active=mysql

# PostgreSQL Profile  
./mvnw spring-boot:run -Dspring.profiles.active=postgres
```

### Database Setup with Docker:
```bash
# MySQL
docker run -e MYSQL_USER=petclinic -e MYSQL_PASSWORD=petclinic -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=petclinic -p 3306:3306 mysql:8.0

# PostgreSQL
docker run -e POSTGRES_USER=petclinic -e POSTGRES_PASSWORD=petclinic -e POSTGRES_DB=petclinic -p 5432:5432 postgres:15-alpine
```

### Railway Database:
For production deployment on Railway, you can easily add:
- **PostgreSQL**: Railway Postgres plugin
- **MySQL**: Railway MySQL plugin
- **Environment Variables**: Automatically configured by Railway

The application automatically detects and uses Railway's database environment variables when deployed.

### Docker Compose Support:
The project includes `docker-compose.yml` for easy database setup:
```bash
# Start MySQL
docker compose up mysql

# Start PostgreSQL
docker compose up postgres
```

## Development and Testing

### Integration Tests:
The application includes specialized test configurations:
- **`PetClinicIntegrationTests`**: H2 database with Spring Boot DevTools
- **`MySqlTestApplication`**: MySQL with Testcontainers
- **`PostgresIntegrationTests`**: PostgreSQL with Docker Compose

### CSS Development:
The project uses SCSS for styling:
- **Source**: `src/main/scss/petclinic.scss`
- **Output**: `src/main/resources/static/resources/css/petclinic.css`
- **Compilation**: `./mvnw package -P css`
- **Framework**: Bootstrap integration

## IDE Setup and Development

### Prerequisites:
- **Java 17 or newer** (full JDK, not a JRE)
- **Git command line tool**
- **Maven 3.6+** (or use included wrapper)
- **Node.js 16+** (for Playwright testing)

### Recommended IDEs:
- **VS Code**: Excellent Spring Boot support with extensions
- **IntelliJ IDEA**: Superior Java development experience
- **Eclipse/STS**: Traditional Spring development environment

### VS Code Setup:
1. Install recommended extensions:
   - Spring Boot Extension Pack
   - Java Extension Pack
   - Playwright Test for VS Code

2. Open the project:
   ```bash
   code .
   ```

3. The application will auto-configure with proper run configurations

### IntelliJ IDEA Setup:
1. **Open Project**: `File -> Open` and select `pom.xml`
2. **Build CSS**: `./mvnw generate-resources` or Maven panel
3. **Run Configuration**: Auto-generated `PetClinicApplication` configuration
4. **Database**: H2 console integration available

### Development Workflow:
1. **Start Application**: Use IDE run configuration or `./mvnw spring-boot:run`
2. **Hot Reload**: Enabled via Spring Boot DevTools
3. **Database**: H2 console at `http://localhost:8080/h2-console`
4. **Testing**: Run Playwright tests with `npx playwright test`
5. **Formatting**: Automatic with spring-javaformat plugin

Access the application at: **http://localhost:8080**

1. Inside IntelliJ IDEA:

    In the main menu, choose `File -> Open` and select the Petclinic [pom.xml](pom.xml). Click on the `Open` button.

    - CSS files are generated from the Maven build. You can build them on the command line `./mvnw generate-resources` or right-click on the `spring-petclinic` project then `Maven -> Generates sources and Update Folders`.

    - A run configuration named `PetClinicApplication` should have been created for you if you're using a recent Ultimate version. Otherwise, run the application by right-clicking on the `PetClinicApplication` main class and choosing `Run 'PetClinicApplication'`.

1. Navigate to the Petclinic

    Visit [http://localhost:8080](http://localhost:8080) in your browser.

## Architecture Reference

|Component | Location  |
|--------------------------|---|
|Main Application Class | `src/main/java/.../PetClinicApplication.java` |
|Configuration Classes | `src/main/java/.../config/` |
|Web Controllers | `src/main/java/.../controller/` |
|Domain Models | `src/main/java/.../model/` |
|Data Repositories | `src/main/java/.../repository/` |
|Application Properties | `src/main/resources/application.properties` |
|Static Resources | `src/main/resources/static/` |
|Templates | `src/main/resources/templates/` |

This project follows **Spring Boot Best Practices** with a Traditional Layered Architecture for clear separation of concerns.

## Technologies Used

This modernized Spring PetClinic implementation leverages current best practices and technologies:

### Core Framework:
- **Spring Boot 3.5.0**: Latest Spring Boot with modern Java features
- **Java 17+**: Modern Java LTS with enhanced performance
- **Maven**: Dependency management and build automation
- **Thymeleaf**: Server-side template engine for web UI

### Testing Stack:
- **JUnit 5**: Unit testing framework
- **Spring Test**: Integration testing support
- **Playwright**: End-to-end browser testing
- **Testcontainers**: Database integration testing

### Database Support:
- **H2**: In-memory database for development
- **MySQL**: Production database option
- **PostgreSQL**: Production database option
- **Spring Data JPA**: Data access abstraction

### Architecture:
- **Traditional Layered Architecture**: Following Spring Boot Best Practices
- **Separation of Concerns**: Clean package structure
- **Dependency Injection**: Spring's IoC container
- **Configuration Management**: Externalized configuration

## Contributing

This project welcomes contributions! Please ensure:
- Code follows spring-javaformat style guidelines
- All tests pass locally
- New features include appropriate test coverage
- Commits follow conventional commit format

## License

The Spring PetClinic sample application is released under version 2.0 of the [Apache License](https://www.apache.org/licenses/LICENSE-2.0).
