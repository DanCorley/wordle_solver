# building base
FROM python:3.9-slim as base

FROM base as builder

WORKDIR /install

RUN apt-get update \
  && apt-get install gcc -y

COPY ./requirements.txt /requirements.txt

RUN pip install --prefix=/install -r /requirements.txt

# production
FROM base

COPY --from=builder /install /usr/local

WORKDIR /streamlit

CMD streamlit run app.py

