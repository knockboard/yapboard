class BaseCRUDRepository:
    def __init__(self, model):
        self.model = model
