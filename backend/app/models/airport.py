"""Airport model with coordinates, codes, and alternative airport grouping."""

from sqlalchemy import String, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Airport(Base):
    __tablename__ = "airports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    iata_code: Mapped[str | None] = mapped_column(String(3), unique=True, index=True)
    icao_code: Mapped[str | None] = mapped_column(String(4), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str | None] = mapped_column(String(255), index=True)
    country: Mapped[str | None] = mapped_column(String(255))
    country_code: Mapped[str | None] = mapped_column(String(2))
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    altitude_ft: Mapped[int | None] = mapped_column(Integer)
    timezone: Mapped[str | None] = mapped_column(String(100))
    # Which group of alternative airports this belongs to (e.g. "dubai_region")
    airport_group: Mapped[str | None] = mapped_column(String(50), index=True)
    # Alternative airport codes within the same region
    alternative_codes: Mapped[list | None] = mapped_column(JSON)

    def __repr__(self) -> str:
        return f"<Airport {self.iata_code} - {self.name}>"
