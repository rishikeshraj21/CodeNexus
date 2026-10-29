package com.codenexus.backend.config;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.repository.ProblemRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class ProblemContentSeeder implements ApplicationRunner {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(ProblemContentSeeder.class);

    private static final List<ProblemContent> CONTENT = List.of(
            new ProblemContent(
                    "Two Sum",
                    """
                    Given a list of integers and a target, find the two distinct positions whose values add up to the target. Return the positions using zero-based indexing, in increasing index order. You may not use the same list element twice; when more than one pair works, return any valid pair.

                    Read n, then n integers, then the target. Print the two indices in the format shown. The array may contain negative values and duplicates.
                    """,
                    "4\n2 7 11 15\n9", "[0,1]",
                    "3\n3 2 4\n6", "[1,2]"
            ),
            new ProblemContent(
                    "Reverse an Array",
                    """
                    Reverse the order of the given integer sequence: the first value becomes last, the second becomes second-to-last, and so on. Preserve every value, including duplicates and negative values.

                    Read n followed by n integers. Print exactly n values in reversed order using the array format shown. A one-element sequence remains unchanged.
                    """,
                    "5\n1 2 3 4 5", "[5,4,3,2,1]",
                    "4\n-1 0 0 8", "[8,0,0,-1]"
            ),
            new ProblemContent(
                    "First Unique Character",
                    """
                    Find the first character in the given lowercase string whose total frequency is exactly one. Return its zero-based position in the original string, not its alphabetical position. If every character repeats, print -1.

                    Scan characters from left to right when selecting the answer. The string contains lowercase English letters and may have no unique character.
                    """,
                    "swiss", "1",
                    "aabbcdd", "4"
            ),
            new ProblemContent(
                    "Longest Increasing Run",
                    """
                    Find the length of the longest contiguous, strictly increasing run in the sequence. Contiguous means that no elements may be skipped; each next value in a run must be greater than the previous value.

                    Read n and then n integers. Print the maximum run length. Equal adjacent values break a run, and a non-empty sequence always has a run of at least one.
                    """,
                    "8\n1 2 2 3 4 0 1 2", "3",
                    "6\n1 2 3 4 5 6", "6"
            ),
            new ProblemContent(
                    "Rotate a Sequence Right",
                    """
                    Rotate the sequence to the right by k positions. Each value that moves past the final position wraps around to the beginning. Rotations repeat every n positions, so reduce k modulo the sequence length.

                    Read n and k, followed by n integers. Print the rotated sequence on one line. A rotation by zero or by a multiple of n leaves the sequence unchanged.
                    """,
                    "5 2\n1 2 3 4 5", "4 5 1 2 3",
                    "4 6\n1 2 3 4", "3 4 1 2"
            ),
            new ProblemContent(
                    "Balanced Bracket String",
                    """
                    Decide whether every opening bracket in the string is closed by the matching bracket type and in the correct nested order. The only valid bracket pairs are (), [], and {}.

                    Print YES for a balanced string and NO otherwise. A closing bracket cannot appear without its matching opener, and a string with leftover open brackets is unbalanced.
                    """,
                    "{[()]}", "YES",
                    "([)]", "NO"
            ),
            new ProblemContent(
                    "Fewest Unlimited Coins",
                    """
                    Given positive coin denominations and a target amount, find the fewest coins that sum exactly to the target. Each denomination can be used any number of times; the order of coins does not matter.

                    Print -1 if the amount cannot be formed. The amount zero requires zero coins. A locally largest coin is not guaranteed to produce the minimum, so consider all valid combinations.
                    """,
                    "3 11\n1 5 7", "3",
                    "3 3\n2 4 6", "-1"
            ),
            new ProblemContent(
                    "Number Palindrome",
                    """
                    Determine whether the usual decimal representation of the signed integer reads the same forward and backward. A minus sign is part of a negative number's representation, so every negative number is not a palindrome.

                    Print YES if the number is a palindrome and NO otherwise. Do not treat leading zeroes as part of the representation.
                    """,
                    "1221", "YES",
                    "-121", "NO"
            ),
            new ProblemContent(
                    "Find the Missing Value",
                    """
                    The input contains n distinct integers selected from the inclusive range 0 through n, with exactly one value absent. Find the missing value.

                    Read n and then the n array values. Print the absent integer. The missing value may be 0 or n; input order is arbitrary.
                    """,
                    "4\n3 0 1 4", "2",
                    "3\n0 1 3", "2"
            ),
            new ProblemContent(
                    "Merge Two Sorted Sequences",
                    """
                    Merge two already sorted, non-decreasing integer sequences into one non-decreasing sequence. Include every value from both inputs; equal values and duplicates must be preserved.

                    Read the two lengths, then each sequence. Print all merged values on one line separated by spaces. Either sequence may be empty.
                    """,
                    "4 3\n1 3 5 8\n2 3 9", "1 2 3 3 5 8 9",
                    "2 2\n-3 2\n-1 5", "-3 -1 2 5"
            ),
            new ProblemContent(
                    "Count the Vowels",
                    """
                    Count occurrences of the five English vowels a, e, i, o, and u in a line of text. Count uppercase and lowercase versions equally; consonants, digits, spaces, and punctuation do not contribute.

                    Read the full line, including any spaces, and print one integer. A line with no vowels produces zero.
                    """,
                    "CodeNexus Academy", "7",
                    "rhythm!", "0"
            ),
            new ProblemContent(
                    "Binary Search Position",
                    """
                    Find the zero-based position of a target in a strictly increasing sorted sequence. If the target is not present, return -1.

                    Read n and the target, followed by n sorted integers. Print the index of the matching value. The target can be smaller than the first value or larger than the last value.
                    """,
                    "6 13\n-4 0 5 9 13 27", "4",
                    "5 8\n1 3 5 7 9", "-1"
            ),
            new ProblemContent(
                    "Maximum Contiguous Sum",
                    """
                    Find the largest possible sum of any non-empty contiguous part of the integer sequence. The chosen part must contain consecutive positions; it may be the entire sequence or a single element.

                    Read n followed by n integers and print the maximum sum. Values may all be negative, so an empty subsequence with sum zero is not allowed.
                    """,
                    "8\n-2 1 -3 4 -1 2 1 -5", "6",
                    "5\n-8 -3 -6 -2 -5", "-2"
            ),
            new ProblemContent(
                    "Main Diagonal Total",
                    """
                    Given an n by n square matrix, sum the entries on its main diagonal: positions where the row and column indices are equal, starting at the top-left corner.

                    Read n and then n rows of n integers. Print the diagonal sum. Values away from the main diagonal do not affect the result, and entries may be negative.
                    """,
                    "3\n1 2 3\n4 5 6\n7 8 9", "15",
                    "2\n-2 100\n3 7", "5"
            ),
            new ProblemContent(
                    "Check for Anagrams",
                    """
                    Determine whether two lowercase English words are anagrams. They are anagrams exactly when each letter occurs the same number of times in both words; character order does not matter.

                    Read one word per line and print YES or NO. Repeated letters must be counted, so having the same set of distinct letters is not sufficient.
                    """,
                    "listen\nsilent", "YES",
                    "hello\nbello", "NO"
            ),
            new ProblemContent(
                    "Greatest Common Divisor and LCM",
                    """
                    For two positive integers a and b, compute their greatest common divisor (the largest positive integer dividing both) and their least common multiple (the smallest positive integer divisible by both).

                    Print gcd(a,b) followed by lcm(a,b), separated by one space. The numbers may share factors or be coprime; compute the LCM without multiplying before reducing by the GCD when possible.
                    """,
                    "12 18", "6 36",
                    "7 5", "1 35"
            ),
            new ProblemContent(
                    "Count Connected Islands",
                    """
                    Count the connected groups of land in a binary grid. A cell containing 1 is land and a cell containing 0 is water. Land cells belong to the same island only when connected horizontally or vertically; diagonal contact alone does not connect them.

                    Read the row and column counts followed by the grid rows. Print the number of islands. A grid with no land contains zero islands.
                    """,
                    "4 5\n11000\n11010\n00100\n00000", "3",
                    "3 3\n100\n010\n001", "3"
            ),
            new ProblemContent(
                    "Product of Array Except Self",
                    """
                    For every array position, calculate the product of all values except the value at that position. Do not use division. Preserve the original order in the output.

                    Read n followed by n integers and print n products separated by spaces. The input may contain zeroes; output exact integer products within the problem's supported range.
                    """,
                    "4\n1 2 3 4", "24 12 8 6",
                    "4\n0 2 3 -1", "-6 0 0 0"
            ),
            new ProblemContent(
                    "Count Staircase Paths",
                    """
                    Count the distinct sequences of one-step and two-step moves that climb exactly n steps. The order of moves matters: taking one step then two is different from taking two then one.

                    Read n and print the number of ways to reach the top. There is one way to remain at the floor when n is zero; for n equal to one, there is one way.
                    """,
                    "5", "8",
                    "0", "1"
            ),
            new ProblemContent(
                    "Run-Length Encoding",
                    """
                    Encode a non-empty lowercase string by replacing each maximal run of identical adjacent characters with that character followed by the run length. Runs of length one must also include the count 1.

                    Read one string and print its encoding with no spaces. Only consecutive matching characters form a run; repeated characters separated by another letter are encoded separately.
                    """,
                    "aaabbc", "a3b2c1",
                    "abbcccc", "a1b2c4"
            )
    );

    private final ProblemRepository problemRepository;

    public ProblemContentSeeder(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        Map<String, ProblemContent> contentByTitle = new HashMap<>();
        for (ProblemContent content : CONTENT) {
            contentByTitle.put(content.title(), content);
        }
        List<Problem> problems = problemRepository.findAll();
        int updated = 0;

        for (Problem problem : problems) {
            ProblemContent content = contentByTitle.get(problem.getTitle());
            if (content == null
                    || (hasText(problem.getSampleInput2())
                            && hasText(problem.getSampleOutput2()))) {
                continue;
            }

            problem.setDescription(content.description());
            problem.setSampleInput(content.sampleInput());
            problem.setSampleOutput(content.sampleOutput());
            problem.setSampleInput2(content.sampleInput2());
            problem.setSampleOutput2(content.sampleOutput2());
            updated++;
        }

        if (updated > 0) {
            problemRepository.saveAll(problems);
            LOGGER.info("Added detailed statements and two examples to {} problems", updated);
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private record ProblemContent(
            String title,
            String description,
            String sampleInput,
            String sampleOutput,
            String sampleInput2,
            String sampleOutput2
    ) { }
}
