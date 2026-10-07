package com.devconnect.config;

import com.devconnect.entity.ConnectionRequest;
import com.devconnect.entity.Project;
import com.devconnect.entity.RequestStatus;
import com.devconnect.entity.User;
import com.devconnect.repository.ConnectionRequestRepository;
import com.devconnect.repository.ProjectRepository;
import com.devconnect.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ConnectionRequestRepository connectionRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           ConnectionRequestRepository connectionRequestRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.connectionRequestRepository = connectionRequestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("password123");

            User alice = new User(
                    "Alice Johnson",
                    "alice@devconnect.io",
                    defaultPassword,
                    "Senior Full-Stack Engineer | React & Spring Boot",
                    "Passionate about building scalable distributed systems and sleek developer tooling. Open to collaborating on open-source initiatives.",
                    "React, Java, Spring Boot, MySQL, Docker, TypeScript",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    "https://github.com/alicejohnson",
                    "https://linkedin.com/in/alicejohnson",
                    "San Francisco, CA"
            );

            User bob = new User(
                    "Bob Chen",
                    "bob@devconnect.io",
                    defaultPassword,
                    "Backend Architect | Cloud & Microservices",
                    "Designing resilient backend architectures and high-throughput data pipelines. Java & Spring Boot evangelist.",
                    "Java, Spring Cloud, Kafka, Kubernetes, MySQL, Redis",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    "https://github.com/bobchen",
                    "https://linkedin.com/in/bobchen",
                    "Seattle, WA"
            );

            User clara = new User(
                    "Clara Rodriguez",
                    "clara@devconnect.io",
                    defaultPassword,
                    "Frontend Lead & UI/UX Specialist",
                    "Crafting delightful, accessible web interfaces for modern SaaS platforms. Exploring modern web animations and micro-frontends.",
                    "React, Next.js, Tailwind CSS, TypeScript, GraphQL",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    "https://github.com/clararodriguez",
                    "https://linkedin.com/in/clararodriguez",
                    "Austin, TX"
            );

            User david = new User(
                    "David Kim",
                    "david@devconnect.io",
                    defaultPassword,
                    "DevOps & Cloud Engineer | AWS Certified",
                    "Automating infrastructure as code and building robust continuous integration/delivery pipelines.",
                    "AWS, Docker, Kubernetes, Terraform, Python, CI/CD",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                    "https://github.com/davidkim",
                    "https://linkedin.com/in/davidkim",
                    "New York, NY"
            );

            userRepository.save(alice);
            userRepository.save(bob);
            userRepository.save(clara);
            userRepository.save(david);

            // Add sample projects
            projectRepository.save(new Project(
                    "DevConnect Platform",
                    "A professional developer networking platform with live connection management, project showcase, and secure JWT auth.",
                    "React, Spring Boot, MySQL, Spring Security, JWT",
                    "https://github.com/devconnect/devconnect",
                    "https://devconnect.preview",
                    alice
            ));

            projectRepository.save(new Project(
                    "CloudMetrics Dashboard",
                    "Real-time Kubernetes monitoring microservice suite with distributed tracing and Grafana dashboards.",
                    "Java, Spring Cloud, Kafka, Docker, Prometheus",
                    "https://github.com/bobchen/cloud-metrics",
                    "https://metrics.preview",
                    bob
            ));

            projectRepository.save(new Project(
                    "Aura Design System",
                    "A comprehensive, accessible component library tailored for dark mode dashboards and developer portals.",
                    "React, TypeScript, CSS Modules, Storybook",
                    "https://github.com/clara/aura-ui",
                    "https://aura-ui.preview",
                    clara
            ));

            // Seed a pending connection request from Bob to Alice, and David connected with Bob
            ConnectionRequest req1 = new ConnectionRequest(bob, alice);
            req1.setStatus(RequestStatus.PENDING);
            connectionRequestRepository.save(req1);

            ConnectionRequest req2 = new ConnectionRequest(david, bob);
            req2.setStatus(RequestStatus.ACCEPTED);
            req2.setUpdatedAt(LocalDateTime.now().minusDays(1));
            connectionRequestRepository.save(req2);
        }
    }
}
