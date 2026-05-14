"""数据处理管道模板"""
import pandas as pd
from typing import Callable, List, Dict, Any
from dataclasses import dataclass
from loguru import logger

@dataclass
class PipelineStep:
    name: str
    transform: Callable[[pd.DataFrame], pd.DataFrame]

class DataPipeline:
    def __init__(self, name: str):
        self.name = name
        self.steps: List[PipelineStep] = []

    def add_step(self, name: str, transform: Callable) -> 'DataPipeline':
        self.steps.append(PipelineStep(name, transform))
        return self

    def run(self, df: pd.DataFrame) -> pd.DataFrame:
        logger.info(f"Pipeline [{self.name}] starting with {len(df)} rows")
        for step in self.steps:
            logger.info(f"  Running: {step.name}")
            df = step.transform(df)
            logger.info(f"  After {step.name}: {len(df)} rows")
        logger.info(f"Pipeline [{self.name}] completed")
        return df

# 使用示例:
# pipeline = (DataPipeline("user-etl")
#     .add_step("clean", lambda df: df.dropna())
#     .add_step("normalize", lambda df: (df - df.mean()) / df.std()))
# result = pipeline.run(raw_data)
