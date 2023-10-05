curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    source ~/.bashrc && \
    nvm install 18 && \
    nvm alias default 18 && \
    git clone https://github.com/openai/democratic-inputs.git && \
    cd democratic-inputs/projects/deliberation_at_scale && \
    npm run setup && \
    cd packages/orchestrator && \
    cp .env.example .env && \
    npx pm2 startup && \
    npm run build && \
    npm run start:prod && \
    npx pm2 save
