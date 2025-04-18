const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require("fs");

app.use(express.json());

const cnaeData = JSON.parse(fs.readFileSync("cnaeData.json", "utf8"));

app.post("/analisar", (req, res) => {
  const { cnae, faturamento, isencoes } = req.body;

  if (!cnaeData[cnae]) {
    return res.status(400).json({ error: "CNAE não encontrado." });
  }

  const atividade = cnaeData[cnae];
  const regimes = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];
  const analise = regimes.map(regime => {
    const estimativa = faturamento * atividade.aliquotaBase[regime];
    const deducao = isencoes?.reduce((total, val) => total + val, 0) || 0;
    const cargaFinal = estimativa - deducao;

    return {
      regime,
      estimativa,
      deducao,
      cargaFinal
    };
  });

  res.json({
    atividade: atividade.nome,
    cnae,
    analise
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});