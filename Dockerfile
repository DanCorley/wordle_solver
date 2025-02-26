# building base
FROM python:3.10-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

FROM base AS builder

WORKDIR /install

RUN apt-get update \
  && apt-get install --no-install-recommends gcc curl -y \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
  
COPY requirements.txt .

RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

RUN curl --create-dirs -o /ny_times/word_list.txt https://gist.githubusercontent.com/cfreshman/d97dbe7004522f7bc52ed2a6e22e2c04/raw/

# production
FROM base

# Create a non-root user
RUN adduser --disabled-password --gecos "" appuser

COPY --from=builder /install /usr/local/
COPY --from=builder /ny_times /ny_times

WORKDIR /app

# Copy application files into the container
COPY ./*.py /app/
COPY ./src/*.py /app/src/

# Set ownership to the non-root user
RUN chown -R appuser:appuser /app /ny_times

# Switch to non-root user
USER appuser

# Healthcheck
HEALTHCHECK --interval=60s --timeout=5s --start-period=30s --retries=2 \
  CMD curl -f http://localhost:8501/ || exit 1

# Set labels for better maintainability
LABEL maintainer="Dan Corley <hello@dancorley.com>" \
      version="1.0.1" \
      description="Wordle Solver Application"

# Use ENTRYPOINT for the application
ENTRYPOINT ["streamlit"]
CMD ["run", "app.py"]
