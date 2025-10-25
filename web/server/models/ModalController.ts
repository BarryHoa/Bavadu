export class ModalController {
  getPagination(options: { data?: any; total?: number }) {
    const { data, total = 0 } = options;
    return {
      data,
      total,
    };
  }
}
