package com.codenexus.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Index;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(
        name = "problems",
        indexes = {
                @Index(name = "idx_problem_category", columnList = "category"),
                @Index(name = "idx_problem_difficulty", columnList = "difficulty"),
                @Index(name = "idx_problem_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    @Column(nullable = false)
    private String title;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;

    @Column(nullable = false)
    private String difficulty;

    @Column(nullable = false)
    private String topic;

    @Column(length = 100)
    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "problem_tags",
            joinColumns = @JoinColumn(name = "problem_id"),
            indexes = @Index(name = "idx_problem_tag", columnList = "tag")
    )
    @Column(name = "tag", nullable = false, length = 100)
    @Builder.Default
    private Set<String> tags = new LinkedHashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ============================================================
    // PROBLEM DETAILS
    // ============================================================

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    // ============================================================
    // SAMPLE
    // ============================================================

    @Column(columnDefinition = "TEXT")
    private String sampleInput;

    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(name = "sample_input_2", columnDefinition = "TEXT")
    private String sampleInput2;

    @Column(name = "sample_output_2", columnDefinition = "TEXT")
    private String sampleOutput2;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        synchronizeCategoryAndTopic();
        normalizeTags();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        synchronizeCategoryAndTopic();
        normalizeTags();
    }

    private void synchronizeCategoryAndTopic() {
        if (category == null || category.isBlank()) {
            category = topic;
        }
        if (topic == null || topic.isBlank()) {
            topic = category;
        }
    }

    private void normalizeTags() {
        if (tags == null) {
            tags = new LinkedHashSet<>();
            return;
        }
        Set<String> normalizedTags = new LinkedHashSet<>();
        for (String tag : tags) {
            if (tag != null && !tag.isBlank()) {
                normalizedTags.add(tag.trim());
            }
        }
        tags = normalizedTags;
    }
}