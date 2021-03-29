import React, { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import api from "../../services/api";

import logoImg from "../../assets/logo.svg";

import { Title, Form, Error, Repositories, RepositoryInfo } from "./style";

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [newRepo, setNewRepo] = useState("");
  const [inputError, setInputError] = useState("");

  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      "@GithubExplorer:repositories"
    );

    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    } else {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "@GithubExplorer:repositories",
      JSON.stringify(repositories)
    );
  }, [repositories]);

  function handleDeleteRepository(fullName: string): void {
    setRepositories(
      repositories.filter((repository) => repository.full_name !== fullName),
    );
  }

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputError("");
      return;
    }

    try {
      const response = await api.get<Repository>(`repos/${newRepo}`);

      const repository = response.data;

      setRepositories([...repositories, repository]);
      setNewRepo("");
      setInputError("");
    } catch (err) {
      setInputError("Repository not found");
    }
  }

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explorer repositories on Github</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          placeholder="Type the owner/repository"
        />
        <button type="submit">Pesquisar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map((repository) => (
          <RepositoryInfo key={repository.full_name}>
            <button
              onClick={() => handleDeleteRepository(repository.full_name)}
              type="button"
            >
              Excluir
            </button>
            <Link
              key={repository.full_name}
              to={`/repositories/${repository.full_name}`}
            >
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>
              <FiChevronRight size={20} />
            </Link>
          </RepositoryInfo>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
