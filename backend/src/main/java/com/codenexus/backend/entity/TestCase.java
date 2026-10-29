package com.codenexus.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // RELATED PROBLEM
    // ============================================================

    @ManyToOne
    @JoinColumn(
            name = "problem_id",
            nullable = false
    )
    private Problem problem;

    // ============================================================
    // INPUT
    // ============================================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String input;

    // ============================================================
    // EXPECTED OUTPUT
    // ============================================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String expectedOutput;

    // ============================================================
    // HIDDEN TEST CASE
    //
    // true  = only admin/judge can use it
    // false = visible test case
    // ============================================================

    @Column(nullable = false)
    private boolean hidden;
}