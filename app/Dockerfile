FROM python:3.11

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the application files
COPY . .

# Ensure rq is available globally
RUN pip install rq
RUN pip install numpy
RUN pip install rq-dashboard
RUN pip install pandas
RUN pip install torch
RUN pip install torch torchvision torchaudio

CMD ["flask", "run", "--host=0.0.0.0"]
