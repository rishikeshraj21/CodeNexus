package com.codenexus.backend.config;

import com.codenexus.backend.entity.QuizQuestion;
import com.codenexus.backend.repository.QuizQuestionRepository;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuizQuestionSeeder {

    @Bean
    ApplicationRunner seedQuizQuestions(
            QuizQuestionRepository questionRepository
    ) {
        return arguments -> {
            if (questionRepository.count() != 0) {
                return;
            }
            questionRepository.saveAll(List.of(
                    new QuizQuestion(
                            "JAVA",
                            "What does == compare when used with two object references?",
                            "The contents of both objects",
                            "Whether both references identify the same object",
                            "The class names only",
                            "The hash codes only",
                            "B",
                            "For object references, == checks identity; equals may compare logical values."
                    ),
                    new QuizQuestion(
                            "JAVA",
                            "Which collection preserves insertion order and allows duplicates?",
                            "HashSet",
                            "TreeSet",
                            "ArrayList",
                            "HashMap",
                            "C",
                            "ArrayList preserves element order and permits duplicate values."
                    ),
                    new QuizQuestion(
                            "DSA",
                            "Which principle does a stack follow?",
                            "FIFO",
                            "LIFO",
                            "Sorted order",
                            "Priority order",
                            "B",
                            "A stack removes the most recently inserted item first."
                    ),
                    new QuizQuestion(
                            "DSA",
                            "What is required before binary search can be applied to an array?",
                            "The array must be sorted",
                            "The array must contain unique values",
                            "The array length must be a power of two",
                            "The array must be circular",
                            "A",
                            "Binary search relies on sorted order to discard half the search space."
                    ),
                    new QuizQuestion(
                            "DBMS",
                            "Which constraint requires a primary-key value to be unique and non-null?",
                            "CHECK",
                            "FOREIGN KEY",
                            "PRIMARY KEY",
                            "DEFAULT",
                            "C",
                            "A primary key uniquely identifies each row and cannot be null."
                    ),
                    new QuizQuestion(
                            "DBMS",
                            "What is a primary goal of database normalization?",
                            "Increase duplicate data",
                            "Reduce redundancy and update anomalies",
                            "Remove all indexes",
                            "Avoid transactions",
                            "B",
                            "Normalization organizes data to reduce redundancy and modification anomalies."
                    ),
                    new QuizQuestion(
                            "OS",
                            "What is a context switch?",
                            "Changing a process's priority permanently",
                            "Saving one task's state and loading another's",
                            "Moving a file between directories",
                            "Translating a virtual address",
                            "B",
                            "The operating system saves the current execution state and restores another task's state."
                    ),
                    new QuizQuestion(
                            "OS",
                            "Which is one of the necessary conditions for deadlock?",
                            "Preemption",
                            "Circular wait",
                            "Time slicing",
                            "Demand paging",
                            "B",
                            "Circular wait is one of the four Coffman conditions for deadlock."
                    ),
                    new QuizQuestion(
                            "CN",
                            "Which transport protocol provides reliable, ordered byte-stream delivery?",
                            "UDP",
                            "IP",
                            "TCP",
                            "ARP",
                            "C",
                            "TCP provides reliable, ordered delivery through a connection-oriented transport."
                    ),
                    new QuizQuestion(
                            "CN",
                            "What is the main purpose of DNS?",
                            "Encrypt network traffic",
                            "Map domain names to IP addresses",
                            "Assign MAC addresses",
                            "Control packet congestion",
                            "B",
                            "DNS resolves human-readable domain names to network records such as IP addresses."
                    )
            ));
        };
    }
}
