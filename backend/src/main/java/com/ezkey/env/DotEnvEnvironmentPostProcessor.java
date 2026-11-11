package com.ezkey.env;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.io.support.ResourcePropertySource;

/**
 * Loads the existing {@code .env.local} / {@code .env} of the repository into the Spring
 * {@code Environment} so the Java backend can read the very same variables the Next.js app reads.
 *
 * <p>This never writes to, renames or edits any env file - it is read-only. Real environment
 * variables always win, exactly like {@code process.env} does in Node.
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor {

  private static final String PROPERTY_SOURCE_NAME = "ezkeyDotEnv";
  private static final List<String> FILE_NAMES = List.of(".env.local", ".env");

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    Map<String, Object> values = new LinkedHashMap<>();

    for (Path root : candidateRoots()) {
      for (String fileName : FILE_NAMES) {
        Path file = root.resolve(fileName);
        if (Files.isRegularFile(file)) {
          values.putAll(parse(file));
        }
      }
    }

    if (!values.isEmpty()) {
      // Added last so genuine environment variables keep priority over file contents.
      environment.getPropertySources().addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, values));
    }
  }

  private List<Path> candidateRoots() {
    Path workingDir = Paths.get("").toAbsolutePath();
    return List.of(workingDir, workingDir.getParent() == null ? workingDir : workingDir.getParent());
  }

  private Map<String, Object> parse(Path file) {
    Map<String, Object> values = new HashMap<>();

    try {
      for (String rawLine : Files.readAllLines(file, StandardCharsets.UTF_8)) {
        String line = rawLine.trim();

        if (line.isEmpty() || line.startsWith("#")) {
          continue;
        }

        if (line.startsWith("export ")) {
          line = line.substring("export ".length()).trim();
        }

        int separator = line.indexOf('=');
        if (separator <= 0) {
          continue;
        }

        String key = line.substring(0, separator).trim();
        String value = stripQuotes(line.substring(separator + 1).trim());

        if (!key.isEmpty()) {
          values.put(key, value);
        }
      }
    } catch (IOException ignored) {
      // An unreadable env file simply means "no extra values"; Spring falls back to real env vars.
    }

    return values;
  }

  private String stripQuotes(String value) {
    if (value.length() >= 2) {
      char first = value.charAt(0);
      char last = value.charAt(value.length() - 1);

      if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
        return value.substring(1, value.length() - 1);
      }
    }

    int comment = value.indexOf(" #");
    return comment >= 0 ? value.substring(0, comment).trim() : value;
  }

  /** Kept for parity with Spring's own env-file support; unused but avoids IDE noise. */
  @SuppressWarnings("unused")
  private static ResourcePropertySource unused() {
    return null;
  }
}
