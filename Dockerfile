# building base
FROM python:3.9-slim AS base

FROM base AS builder

WORKDIR /install

RUN apt-get update \
  && apt-get install gcc curl -y
  
COPY ./requirements.txt /requirements.txt

RUN pip install --prefix=/install -r /requirements.txt

RUN curl --create-dirs -o /ny_times/word_list.txt https://gist.githubusercontent.com/cfreshman/d97dbe7004522f7bc52ed2a6e22e2c04/raw/

# production
FROM base

COPY --from=builder /install /usr/local/
COPY --from=builder /ny_times /ny_times

WORKDIR /streamlit

CMD ["streamlit", "run", "app.py"]

