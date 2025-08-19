import logging
from datetime import datetime
import os
from pathlib import Path

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        # Console handler
        logging.StreamHandler(),
        # File handler - new file for each day
        logging.FileHandler(
            filename=f"logs/wealthify_{datetime.now().strftime('%Y-%m-%d')}.log"
        )
    ]
)

logger = logging.getLogger("wealthify")

def log_error(error: Exception, context: dict = None):
    """
    Log error with context
    """
    error_details = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'context': context or {}
    }
    logger.error(f"Error occurred: {error_details}", exc_info=True)

def log_info(message: str, context: dict = None):
    """
    Log info with context
    """
    logger.info(f"{message} - Context: {context or {}}")

def log_warning(message: str, context: dict = None):
    """
    Log warning with context
    """
    logger.warning(f"{message} - Context: {context or {}}")

def log_debug(message: str, context: dict = None):
    """
    Log debug with context
    """
    logger.debug(f"{message} - Context: {context or {}}")
